import json
import os
import re
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
    try:
        parsed = json.loads(candidate_text)
    except json.JSONDecodeError as exc:
        raise ValueError("Gemini response is not valid JSON") from exc

    return normalize_gemini_output(parsed)


def call_gemini(messages: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
    """Call the Gemini API using environment-configured API key and model.

    Reads `GEMINI_API_KEY` and `GEMINI_MODEL` from the environment (or from
    a loaded .env). Returns a dict containing the generated text on success,
    or a dict with an `error` key when the request fails. This function will
    not raise on network/connection issues to keep callers resilient.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL")

    if not api_key or not model:
        raise RuntimeError("GEMINI_API_KEY and GEMINI_MODEL must be set in the environment")

    client = genai.Client(api_key=api_key)
    payload_text = _render_prompt_text(messages)

    try:
        response = client.models.generate_content(model=model, contents=payload_text)
        raw_text = getattr(response, "text", None)
        if raw_text is None:
            return {"error": "invalid_response", "details": "Gemini response did not contain text"}

        try:
            return {"text": parse_gemini_response(raw_text)}
        except ValueError as exc:
            return {"error": "invalid_json_response", "details": str(exc)}
    except Exception as exc:
        print(f"Gemini request failed: {exc}")
        return {"error": "connection_failed", "details": str(exc)}
