import json
import urllib.request

payload = {
    "recipient_age_group": "20代",
    "recipient_gender": "unspecified",
    "relationship": "friend",
    "purpose": "birthday",
    "budget_min": 3000,
    "budget_max": 5000,
    "hobbies": ["coffee"],
    "avoid_items": [],
    "desired_mood": "practical",
    "note": "テスト用の確認",
}

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/consultations",
    data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
    headers={"Content-Type": "application/json", "Authorization": "Bearer dummy-token"},
    method="POST",
)

with urllib.request.urlopen(req) as res:
    print("STATUS", res.status)
    print(res.read().decode("utf-8"))
