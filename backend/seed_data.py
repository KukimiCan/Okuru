"""
seed_data.py — ダミーデータ投入スクリプト（本物の Gemini 経由）

既存のバックエンド実装（app.crud.consultation.create_consultation /
app.crud.story.create_story）をそのまま再利用し、
  1. 本物の Gemini API で「AI相談」を N 件生成・保存
  2. その相談結果をもとに、Gemini で充実した本文の「体験談」を N 件生成・保存
します。ログイン中のあなたのアカウント（auth.users）に紐づけて Supabase に投入します。

使い方（backend ディレクトリで、いつもバックエンドを動かしている venv のまま）:
    python seed_data.py
    python seed_data.py --email you@example.com         # 対象ユーザーをメールで指定
    python seed_data.py --user-id <auth.usersのUUID>     # 直接UUID指定
    python seed_data.py --consultations 10 --stories 10  # 件数指定（既定 10/10）
    python seed_data.py --no-backdate                    # created_at を過去日に散らさない

.env（backend/.env）の GEMINI_API_KEY / GEMINI_MODEL / SUPABASE_URL /
SUPABASE_SERVICE_ROLE_KEY を使用します。シークレットはコードに書きません。
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
import time
from datetime import datetime, timedelta, timezone

# このスクリプトの場所（backend/）を import パスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv()

from google import genai  # noqa: E402

from app.db.database import get_supabase  # noqa: E402
from app.crud.consultation import create_consultation  # noqa: E402
from app.crud.story import create_story  # noqa: E402
from app.services.ai_prompt import _extract_json_candidate  # noqa: E402


DEFAULT_EMAIL = "41055ht@gmail.com"


# ---- 相談の入力サンプル（ConsultationRequest と同じ形） ----------------------

CONSULTATION_INPUTS = [
    {
        "recipient_age_group": "20代", "recipient_gender": "女性",
        "relationship": "友人", "purpose": "誕生日",
        "budget_min": 3000, "budget_max": 5000,
        "hobbies": ["カフェ巡り", "読書"], "avoid_items": ["かさばるもの"],
        "desired_mood": "おしゃれで気が利く感じ",
        "note": "最近一人暮らしを始めた友人へ。実用的だけど少し気分が上がるものがいい。",
    },
    {
        "recipient_age_group": "20代", "recipient_gender": "男性",
        "relationship": "恋人・パートナー", "purpose": "記念日",
        "budget_min": 5000, "budget_max": 10000,
        "hobbies": ["料理", "映画鑑賞"], "avoid_items": ["消耗品"],
        "desired_mood": "特別感のある贈り物",
        "note": "付き合って1年の記念日。長く使えるものを贈りたい。",
    },
    {
        "recipient_age_group": "50代", "recipient_gender": "女性",
        "relationship": "家族", "purpose": "季節の贈り物",
        "budget_min": 3000, "budget_max": 5000,
        "hobbies": ["ガーデニング", "お茶"], "avoid_items": ["甘いもの"],
        "desired_mood": "上品で落ち着いた印象",
        "note": "母の日に。毎日の暮らしで使ってもらえるものを。",
    },
    {
        "recipient_age_group": "40代", "recipient_gender": "男性",
        "relationship": "同僚・上司", "purpose": "退職・送別",
        "budget_min": 5000, "budget_max": 10000,
        "hobbies": ["ゴルフ", "コーヒー"], "avoid_items": ["香りが強いもの"],
        "desired_mood": "きちんとした、失礼のない贈り物",
        "note": "お世話になった上司の送別。形に残りつつ実用的なもの。",
    },
    {
        "recipient_age_group": "30代", "recipient_gender": "女性",
        "relationship": "友人", "purpose": "お礼",
        "budget_min": 1000, "budget_max": 3000,
        "hobbies": ["お菓子作り", "紅茶"], "avoid_items": ["日持ちしないもの"],
        "desired_mood": "気軽でカジュアル",
        "note": "引っ越しを手伝ってくれたお礼に、ちょっとしたものを。",
    },
    {
        "recipient_age_group": "20代", "recipient_gender": "女性",
        "relationship": "恋人・パートナー", "purpose": "誕生日",
        "budget_min": 10000, "budget_max": 20000,
        "hobbies": ["ファッション", "旅行"], "avoid_items": ["サイズが難しいもの"],
        "desired_mood": "上質で長く使えるもの",
        "note": "節目の誕生日。少し奮発して上質なものを贈りたい。",
    },
    {
        "recipient_age_group": "60代以上", "recipient_gender": "男性",
        "relationship": "家族", "purpose": "誕生日",
        "budget_min": 5000, "budget_max": 10000,
        "hobbies": ["日本酒", "将棋"], "avoid_items": ["健康に悪いもの"],
        "desired_mood": "落ち着いた大人向け",
        "note": "父の還暦。晩酌の時間が楽しくなるようなものを。",
    },
    {
        "recipient_age_group": "40代", "recipient_gender": "回答しない",
        "relationship": "同僚・上司", "purpose": "季節の贈り物",
        "budget_min": 3000, "budget_max": 5000,
        "hobbies": ["食べ歩き", "ワイン"], "avoid_items": ["好みが分かれるもの"],
        "desired_mood": "無難で外さない",
        "note": "お世話になっている取引先へのお中元的な贈り物。",
    },
    {
        "recipient_age_group": "30代", "recipient_gender": "女性",
        "relationship": "その他", "purpose": "記念日",
        "budget_min": 10000, "budget_max": 20000,
        "hobbies": ["インテリア", "料理"], "avoid_items": ["置き場所に困るもの"],
        "desired_mood": "華やかでお祝いらしい",
        "note": "友人夫婦の結婚祝い。新生活で使えて見栄えのするもの。",
    },
    {
        "recipient_age_group": "20代", "recipient_gender": "男性",
        "relationship": "友人", "purpose": "誕生日",
        "budget_min": 1000, "budget_max": 3000,
        "hobbies": ["ゲーム", "音楽"], "avoid_items": ["かさばるもの"],
        "desired_mood": "気軽でセンスのいい感じ",
        "note": "学生時代からの友人。気を使わせない価格で楽しいものを。",
    },
]

# 体験談の結果分布（success=喜ばれた / normal=無難 / failure=反省点あり）
RESULT_SEQUENCE = [
    "success", "success", "success", "normal", "failure",
    "success", "normal", "success", "success", "normal",
]
RESULT_TONE = {
    "success": "とても喜ばれた、贈ってよかったという前向きなトーン",
    "normal": "悪くはないが無難で、可もなく不可もなかったというトーン",
    "failure": "反省点があり、次はこうしたいという気づきを含むトーン",
}


def estimate_budget_range(budget_min: int, budget_max: int) -> str:
    reference = budget_max if budget_max > 0 else budget_min
    if reference <= 3000:
        return "1000-3000"
    if reference <= 5000:
        return "3000-5000"
    if reference <= 10000:
        return "5000-10000"
    return "10000+"


def resolve_user_id(supabase, email: str | None, user_id: str | None) -> str:
    if user_id:
        return user_id
    target = (email or DEFAULT_EMAIL).lower()
    try:
        users = supabase.auth.admin.list_users()
    except Exception as exc:  # pragma: no cover
        raise SystemExit(
            f"ユーザー一覧の取得に失敗しました: {exc}\n"
            "--user-id <UUID> で直接指定してください。"
        )
    # supabase-py のバージョン差を吸収
    if isinstance(users, dict):
        users = users.get("users", [])
    if hasattr(users, "users"):
        users = users.users
    for u in users:
        u_email = getattr(u, "email", None) or (u.get("email") if isinstance(u, dict) else None)
        u_id = getattr(u, "id", None) or (u.get("id") if isinstance(u, dict) else None)
        if u_email and u_email.lower() == target and u_id:
            return u_id
    raise SystemExit(
        f"メール {target} のユーザーが見つかりませんでした。\n"
        "--email で正しいメールを指定するか、--user-id <UUID> を使ってください。"
    )


def generate_story_content(client, model, inp: dict, candidate: dict, result_key: str) -> dict:
    budget_label = estimate_budget_range(inp["budget_min"], inp["budget_max"])
    prompt = (
        "あなたは贈り物の体験談を書くライターです。実際に贈った人の一人称で、"
        "自然で生活感のある日本語の体験談を書いてください。\n"
        "出力は必ず JSON のみ（説明文や前置きは禁止）。キーは title, body, keywords の3つだけ。\n"
        "- body は350〜500字程度。選んだ理由・渡した場面・相手の反応・気づきを具体的に含める\n"
        f"- 全体のトーンは「{RESULT_TONE[result_key]}」に合わせる\n"
        "- URL・ブランド名・販売サイト名・個人を特定できる固有名詞は書かない\n"
        "- keywords は検索用の短い語を3〜5個の配列で\n\n"
        "条件:\n"
        f"- 相手との関係: {inp['relationship']}\n"
        f"- 目的: {inp['purpose']}\n"
        f"- 予算帯: {budget_label}\n"
        f"- 贈ったもの: {candidate.get('name', '')}\n"
        f"- 候補に挙がった理由: {candidate.get('reason', '')}\n\n"
        'JSON形式: {"title": "", "body": "", "keywords": [""]}'
    )
    try:
        resp = client.models.generate_content(model=model, contents=prompt)
        raw = getattr(resp, "text", None)
        if not raw:
            raise ValueError("empty response")
        data = json.loads(_extract_json_candidate(raw))
        title = str(data.get("title") or "").strip()
        body = str(data.get("body") or "").strip()
        keywords = data.get("keywords") or []
        if not isinstance(keywords, list):
            keywords = []
        keywords = [str(k).strip() for k in keywords if str(k).strip()][:5]
        if not title or not body:
            raise ValueError("missing title/body")
        return {"title": title, "body": body, "keywords": keywords}
    except Exception as exc:
        print(f"    ! 体験談生成に失敗、フォールバックを使用: {exc}")
        return {
            "title": f"{candidate.get('name', 'ギフト')}を贈った話",
            "body": (
                f"{inp['relationship']}への{inp['purpose']}に、{candidate.get('name', '贈り物')}を選びました。"
                f"{candidate.get('reason', '相手に合うと思い選びました。')}"
                "渡したときの反応も思い出に残っています。次の機会の参考にしたいと思います。"
            ),
            "keywords": list(inp.get("hobbies", []))[:3] or ["ギフト"],
        }


def backdate(supabase, table: str, row_id: str, when: datetime) -> None:
    iso = when.isoformat()
    try:
        supabase.table(table).update({"created_at": iso, "updated_at": iso}).eq("id", row_id).execute()
    except Exception as exc:  # 失敗しても致命的ではない
        print(f"    ! created_at の調整に失敗: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Okuru ダミーデータ投入（本物のGemini経由）")
    parser.add_argument("--email", default=None, help="対象ユーザーのメール（既定: %s）" % DEFAULT_EMAIL)
    parser.add_argument("--user-id", default=os.getenv("SEED_USER_ID"), help="対象ユーザーの auth UUID")
    parser.add_argument("--consultations", type=int, default=10, help="相談の件数（既定10）")
    parser.add_argument("--stories", type=int, default=10, help="体験談の件数（既定10）")
    parser.add_argument("--no-backdate", action="store_true", help="created_at を過去に散らさない")
    parser.add_argument("--sleep", type=float, default=1.0, help="API呼び出し間の待機秒数")
    args = parser.parse_args()

    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL")
    if not api_key or not model:
        raise SystemExit("backend/.env に GEMINI_API_KEY と GEMINI_MODEL を設定してください。")

    supabase = get_supabase()
    user_id = resolve_user_id(supabase, args.email, args.user_id)
    print(f"対象ユーザー: {user_id}")

    client = genai.Client(api_key=api_key)
    now = datetime.now(timezone.utc)

    n_cons = max(0, min(args.consultations, len(CONSULTATION_INPUTS)))
    n_stories = max(0, min(args.stories, len(CONSULTATION_INPUTS)))

    # ---- 1) 相談を本物のGeminiで生成・保存 ----
    print(f"\n[1/2] AI相談を {n_cons} 件生成します（本物のGemini経由）...")
    created = []
    for i in range(n_cons):
        inp = CONSULTATION_INPUTS[i]
        print(f"  - 相談 {i + 1}/{n_cons}: {inp['relationship']}/{inp['purpose']} ...", flush=True)
        saved = create_consultation(supabase, user_id, dict(inp))
        created.append((inp, saved))
        if not args.no_backdate:
            backdate(supabase, "gift_consultations", saved["consultation_id"],
                     now - timedelta(days=random.randint(20, 90), hours=random.randint(0, 23)))
        time.sleep(args.sleep)

    # ---- 2) 相談結果をもとに体験談を生成・保存 ----
    print(f"\n[2/2] 体験談を {n_stories} 件生成します（相談結果ベース・本物のGemini経由）...")
    for i in range(n_stories):
        inp = CONSULTATION_INPUTS[i]
        # 対応する相談結果があれば候補を使い、なければ生成
        if i < len(created):
            result = created[i][1]["result"]
        else:
            result = create_consultation(supabase, user_id, dict(inp))["result"]
        candidates = result.get("gift_candidates") or []
        candidate = candidates[0] if candidates else {"name": "実用的なギフト", "reason": ""}
        result_key = RESULT_SEQUENCE[i % len(RESULT_SEQUENCE)]

        print(f"  - 体験談 {i + 1}/{n_stories}: {candidate.get('name', '')}（{result_key}）...", flush=True)
        content = generate_story_content(client, model, inp, candidate, result_key)

        story_data = {
            "title": content["title"],
            "relationship": inp["relationship"],
            "purpose": inp["purpose"],
            "budget_range": estimate_budget_range(inp["budget_min"], inp["budget_max"]),
            "gift_item": candidate.get("name", "ギフト"),
            "result": result_key,
            "body": content["body"],
            "visibility": "public",
            "keywords": content["keywords"] or list(inp.get("hobbies", []))[:3],
        }
        saved_story = create_story(supabase, user_id, story_data)
        if not args.no_backdate:
            backdate(supabase, "gift_stories", saved_story["id"],
                     now - timedelta(days=random.randint(1, 75), hours=random.randint(0, 23)))
        time.sleep(args.sleep)

    print(f"\n完了しました。相談 {n_cons} 件 / 体験談 {n_stories} 件を投入しました。")
    print("アプリの「相談履歴」「体験談」ページで確認してください。")


if __name__ == "__main__":
    main()
