import json
import os
import re
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from google import genai

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


def _safe_fallback_output(reason: str) -> Dict[str, Any]:
    """Return a minimal safe output when Gemini responses are unreliable."""
    return {
        "output": {
            "summary": "AI応答の整形に失敗したため、簡易的な安全な案を表示します。",
            "gift_candidates": [
                {
                    "name": "安全な提案案",
                    "reason": "AIの応答が安定しなかったため、最低限の案として表示します。",
                    "budget_range": "目安は入力内容をご確認ください",
                    "caution": "詳細な候補は再試行後に確認してください。",
                    "suitable_for": "一般的なギフト選び",
                    "message": "一度お試しください。",
                }
            ],
            "tips": ["応答が不安定な場合は少し時間を置いてから再度お試しください。"],
            "avoid": ["未確認のブランドや販売サイトの推奨は避けています。"],
        }
    }


def _contains_forbidden_content(text: str) -> bool:
    """Detect obviously unsafe or disallowed output before parsing."""
    forbidden_patterns = [r"https?://", r"販売サイト", r"ブランド名", r"ここは推奨"]
    return any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in forbidden_patterns)


def _render_prompt_text(messages: List[Dict[str, str]]) -> str:
    return "\n\n".join([f"{message['role'].upper()}:\n{message['content']}" for message in messages])


def _extract_json_candidate(text: str) -> str:
    """Extract a JSON object/array candidate from Gemini output.

    The function prefers fenced code blocks and otherwise scans for the first
    top-level JSON object/array. It intentionally does not attempt to repair
    malformed JSON.
    """
    if not isinstance(text, str):
        raise ValueError("Gemini response text is not a string")

    fenced_blocks = re.findall(r"```(?:json)?\s*(.*?)```", text, flags=re.IGNORECASE | re.DOTALL)
    for block in fenced_blocks:
        candidate = block.strip()
        if candidate:
            try:
                json.loads(candidate)
                return candidate
            except json.JSONDecodeError:
                continue

    start_index = min(
        [text.find("{") if text.find("{") != -1 else len(text), text.find("[") if text.find("[") != -1 else len(text)],
        default=len(text),
    )

    if start_index == len(text):
        raise ValueError("No JSON object or array found in Gemini response")

    open_char = text[start_index]
    close_char = "}" if open_char == "{" else "]"
    depth = 0
    in_string = False
    escaped = False

    for index in range(start_index, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue

        if char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                candidate = text[start_index:index + 1].strip()
                try:
                    json.loads(candidate)
                    return candidate
                except json.JSONDecodeError:
                    raise ValueError("Gemini response contains invalid JSON")

    raise ValueError("Gemini response contains incomplete JSON")


def normalize_gemini_output(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize Gemini output to the spec-defined structure.

    The function fills missing keys with safe defaults, but only after the
    response has already been parsed successfully as valid JSON.
    """
    if not isinstance(payload, dict):
        raise ValueError("Gemini response must be a JSON object")

    output = payload.get("output")
    if not isinstance(output, dict):
        raise ValueError("Gemini response must contain an 'output' object")

    summary = output.get("summary", "") if isinstance(output.get("summary", ""), str) else ""
    raw_candidates = output.get("gift_candidates", [])
    if not isinstance(raw_candidates, list):
        raise ValueError("'gift_candidates' must be an array")

    normalized_candidates = []
    for candidate in raw_candidates:
        if not isinstance(candidate, dict):
            raise ValueError("Each gift candidate must be an object")

        normalized_candidates.append(
            {
                "name": candidate.get("name", "") if isinstance(candidate.get("name", ""), str) else "",
                "reason": candidate.get("reason", "") if isinstance(candidate.get("reason", ""), str) else "",
                "budget_range": candidate.get("budget_range", "") if isinstance(candidate.get("budget_range", ""), str) else "",
                "caution": candidate.get("caution", "") if isinstance(candidate.get("caution", ""), str) else "",
                "suitable_for": candidate.get("suitable_for", "") if isinstance(candidate.get("suitable_for", ""), str) else "",
                "message": candidate.get("message", "") if isinstance(candidate.get("message", ""), str) else "",
            }
        )

    tips = output.get("tips", [])
    avoid = output.get("avoid", [])
    if not isinstance(tips, list):
        raise ValueError("'tips' must be an array")
    if not isinstance(avoid, list):
        raise ValueError("'avoid' must be an array")

    return {
        "output": {
            "summary": summary,
            "gift_candidates": normalized_candidates,
            "tips": tips,
            "avoid": avoid,
        }
    }


def parse_gemini_response(text: str) -> Dict[str, Any]:
    """Parse Gemini output strictly as JSON and normalize the shape."""
    candidate_text = _extract_json_candidate(text)
    if _contains_forbidden_content(candidate_text):
        raise ValueError("Gemini response contains forbidden or unsafe content")

    try:
        parsed = json.loads(candidate_text)
    except json.JSONDecodeError as exc:
        raise ValueError("Gemini response is not valid JSON") from exc

    return normalize_gemini_output(parsed)


def call_gemini(messages: List[Dict[str, str]], max_retries: int = 2) -> Optional[Dict[str, Any]]:
    """Call Gemini with retries and a safe fallback when parsing fails.

    The function retries transient JSON parsing and connection failures, and
    falls back to a minimal safe output after the configured number of retries.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL")

    if not api_key or not model:
        raise RuntimeError("GEMINI_API_KEY and GEMINI_MODEL must be set in the environment")

    client = genai.Client(api_key=api_key)
    payload_text = _render_prompt_text(messages)

    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(model=model, contents=payload_text)
            raw_text = getattr(response, "text", None)
            if raw_text is None:
                if attempt < max_retries:
                    time.sleep(0.2 * (attempt + 1))
                    continue
                return {"text": _safe_fallback_output("Gemini response did not contain text")}

            try:
                return {"text": parse_gemini_response(raw_text)}
            except ValueError as exc:
                if attempt < max_retries:
                    time.sleep(0.2 * (attempt + 1))
                    continue
                print(f"Gemini response invalid after retries: {exc}")
                return {"text": _safe_fallback_output(str(exc))}
        except Exception as exc:
            if attempt < max_retries:
                time.sleep(0.2 * (attempt + 1))
                continue
            print(f"Gemini request failed after retries: {exc}")
            return {"text": _safe_fallback_output(str(exc))}

    return {"text": _safe_fallback_output("Gemini response could not be prepared safely")}
