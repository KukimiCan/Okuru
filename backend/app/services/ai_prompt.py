import json
import os
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """あなたはギフト提案アシスタントです。
以下の制約を必ず守って回答してください。

- 必ず JSON 形式のみを出力する
- 余計な説明や会話文を含めない
- トップレベルは `output` のみとする
- `output` に指定した構造を厳密に守る
- 予算や条件に合わない候補を提案しない
- 特定ブランドや販売サイトは推奨しない
- 個人情報やプライバシーに関する質問を含めない
"""

OUTPUT_SCHEMA_TEMPLATE: Dict[str, Any] = {
    "summary": "",
    "gift_candidates": [
        {
            "name": "",
            "reason": "",
            "budget_range": "",
            "caution": "",
            "suitable_for": "",
            "message": "",
        }
    ],
    "tips": [""],
    "avoid": [""],
}


def _render_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def build_ai_prompt_messages(input_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """Generate system/user messages for the AI gift suggestion prompt."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": _build_user_message(input_data)},
    ]


def _build_user_message(input_data: Dict[str, Any]) -> str:
    return (
        "次の input をもとにギフト候補を提案してください。\n"
        "必ず JSON のみを出力し、トップレベルは `output` のみとしてください。\n"
        "出力形式は以下の通りです。\n\n"
        "output:\n"
        f"{_render_json(OUTPUT_SCHEMA_TEMPLATE)}\n\n"
        "input:\n"
        f"{_render_json(input_data)}\n\n"
        "注意: `output` 以外のトップレベルキーを追加しないでください。"
    )


def get_output_schema_template() -> Dict[str, Any]:
    """Return a copy of the expected AI output schema."""
    return json.loads(_render_json(OUTPUT_SCHEMA_TEMPLATE))


def call_gemini(messages: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
    """Call the Gemini API using environment-configured API key and model.

    Reads `GEMINI_API_KEY` and `GEMINI_MODEL` from the environment (or from
    a loaded .env). Returns the JSON response on success, or a dict with an
    `error` key when the network/HTTP request fails. This function will not
    raise on connection errors to keep callers resilient.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL")

    if not api_key or not model:
        raise RuntimeError("GEMINI_API_KEY and GEMINI_MODEL must be set in the environment")

    base = os.getenv("GEMINI_API_BASE", "https://generativeai.googleapis.com/v1")
    url = f"{base}/models/{model}:generateText"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # The exact request body expected by the Gemini API can vary. We include
    # `messages` under a `prompt` key here; callers can adapt as needed.
    payload = {"prompt": {"messages": messages}}

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as exc:
        # Do not raise on network/connection issues; return an error dict so
        # callers can continue operating without crashing.
        print(f"Gemini request failed: {exc}")
        return {"error": "connection_failed", "details": str(exc)}
