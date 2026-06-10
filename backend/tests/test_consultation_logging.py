import unittest

from app.crud.consultation import build_log_payload


class ConsultationLoggingTest(unittest.TestCase):
    def test_build_log_payload_keeps_key_fields_and_masks_sensitive_text(self):
        input_data = {
            "recipient_age_group": "20代",
            "relationship": "友人",
            "purpose": "誕生日",
            "budget_min": 3000,
            "budget_max": 5000,
            "note": "山田太郎さん 090-1234-5678 に贈りたい",
        }

        payload = build_log_payload(
            input_data=input_data,
            ai_summary="実用的で温かみのある候補を提案します",
            status="success",
            error_details=None,
        )

        self.assertEqual(payload["status"], "success")
        self.assertEqual(payload["relationship"], "友人")
        self.assertEqual(payload["purpose"], "誕生日")
        self.assertEqual(payload["budget_min"], 3000)
        self.assertEqual(payload["budget_max"], 5000)
        self.assertIn("AI回答要約", payload)
        self.assertNotIn("山田太郎", payload["note"])
        self.assertNotIn("090-1234-5678", payload["note"])

    def test_build_log_payload_records_error_details(self):
        payload = build_log_payload(
            input_data={"relationship": "家族", "purpose": "母の日"},
            ai_summary="",
            status="error",
            error_details="Gemini API unavailable",
        )

        self.assertEqual(payload["status"], "error")
        self.assertEqual(payload["error_details"], "Gemini API unavailable")
