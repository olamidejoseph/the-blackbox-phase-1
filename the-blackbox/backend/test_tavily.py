import os
from pathlib import Path

from dotenv import load_dotenv
from tavily import TavilyClient

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env", override=True)

api_key = os.getenv("TAVILY_API_KEY")

print("API key detected:", bool(api_key))

if not api_key:
    raise SystemExit("ERROR: Tavily API key not found.")

try:
    client = TavilyClient(api_key=api_key)

    print("\nTesting Tavily connection...")

    response = client.search(
        query="Latest developments in petroleum engineering",
        max_results=3
    )

    print("\nSUCCESS!")
    print("Results retrieved:", len(response.get("results", [])))

    for index, result in enumerate(response.get("results", []), start=1):
        print(f"\nResult {index}")
        print("Title:", result.get("title"))
        print("URL:", result.get("url"))
        print("Content:", result.get("content", "")[:200])

except Exception as error:
    print("\nTAVILY TEST FAILED")
    print("Error type:", type(error).__name__)
    print("Error:", error)