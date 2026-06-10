import unittest

from app.services.ai_prompt import parse_gemini_response


class GeminiResponseParserTests(unittest.TestCase):
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
