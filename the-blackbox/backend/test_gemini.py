import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env", override=True)

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

print("API key detected:", bool(api_key))
print("Model configured:", model)

if not api_key:
    raise SystemExit("ERROR: Gemini API key not found.")

try:
    client = genai.Client(api_key=api_key)

    print("\nTesting Gemini connection...")

    response = client.models.generate_content(
        model=model,
        contents="Reply with exactly: Gemini is working."
    )

    print("\nSUCCESS!")
    print("Gemini response:", response.text)

except Exception as error:
    print("\nGEMINI TEST FAILED")
    print("Error type:", type(error).__name__)
    print("Error:", error)