import unittest
from unittest.mock import Mock, patch

from app.services.ai_prompt import call_gemini, parse_gemini_response


class GeminiResponseParserTests(unittest.TestCase):
    @patch.dict("os.environ", {"GEMINI_API_KEY": "test-key", "GEMINI_MODEL": "gemini-test"}, clear=False)
    def test_call_gemini_retries_invalid_json_and_returns_safe_fallback(self) -> None:
        fake_client = Mock()
        fake_client.models.generate_content.side_effect = [
            Mock(text='{"output": {"summary": "broken", "gift_candidates": "oops"}}'),
            Mock(text='not json'),
            Mock(text='still invalid'),
        ]

        with patch("app.services.ai_prompt.genai.Client", return_value=fake_client):
            result = call_gemini([{"role": "user", "content": "hello"}])

        self.assertIn("text", result)
        self.assertEqual(result["text"]["output"]["summary"], "AI応答の整形に失敗したため、簡易的な安全な案を表示します。")
        self.assertEqual(fake_client.models.generate_content.call_count, 3)

    @patch.dict("os.environ", {"GEMINI_API_KEY": "test-key", "GEMINI_MODEL": "gemini-test"}, clear=False)
    def test_call_gemini_retries_connection_errors_before_fallback(self) -> None:
        fake_client = Mock()
        fake_client.models.generate_content.side_effect = [RuntimeError("temporary failure"), RuntimeError("temporary failure"), Mock(text='{"output": {"summary": "ok"}}')]

        with patch("app.services.ai_prompt.genai.Client", return_value=fake_client):
            result = call_gemini([{"role": "user", "content": "hello"}])

        self.assertIn("text", result)
        self.assertEqual(result["text"]["output"]["summary"], "ok")
        self.assertEqual(fake_client.models.generate_content.call_count, 3)
    def test_parse_gemini_response_extracts_json_from_fenced_block(self) -> None:
        raw_text = '''
        こちらが提案です。

        ```json
        {
          "output": {
            "summary": "実用性重視",
            "gift_candidates": [
              {
                "name": "マグカップ"
              }
            ]
          }
        }
        ```
        '''

        result = parse_gemini_response(raw_text)

        self.assertEqual(result["output"]["summary"], "実用性重視")
        self.assertEqual(result["output"]["gift_candidates"][0]["reason"], "")
        self.assertEqual(result["output"]["gift_candidates"][0]["budget_range"], "")
        self.assertEqual(result["output"]["gift_candidates"][0]["caution"], "")
        self.assertEqual(result["output"]["gift_candidates"][0]["suitable_for"], "")
        self.assertEqual(result["output"]["gift_candidates"][0]["message"], "")
        self.assertEqual(result["output"]["tips"], [])
        self.assertEqual(result["output"]["avoid"], [])

    def test_parse_gemini_response_rejects_invalid_json(self) -> None:
        raw_text = '''
        ```json
        {"output": {"summary": }}
        ```
        '''

        with self.assertRaises(ValueError):
            parse_gemini_response(raw_text)


if __name__ == "__main__":
    unittest.main()
