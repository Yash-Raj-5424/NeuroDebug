#!/usr/bin/env python3

import requests
import json


def test_explain_code_api():
    test_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def fibonacci_optimized(n):
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b

print("Recursive:", fibonacci(10))
print("Optimized:", fibonacci_optimized(10))
"""

    url = "http://127.0.0.1:8000/api/explain-code"
    payload = {"language": "python", "code": test_code}

    print("Testing Code Explanation API...")
    print("=" * 50)
    print(f"URL: {url}")
    print(f"Code length: {len(test_code)} characters")
    print("=" * 50)

    try:
        response = requests.post(url, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()

            print("API Response Success!")
            print(f"Explanation: {result.get('explanation', 'No explanation')}")
            print(f"Time Complexity: {result.get('time_complexity', 'Not provided')}")
            print(f"Space Complexity: {result.get('space_complexity', 'Not provided')}")
            print(f"Confidence: {result.get('confidence', 0)}")

            optimizations = result.get("optimizations", [])
            if optimizations:
                print(f"\nOptimizations ({len(optimizations)}):")
                for i, opt in enumerate(optimizations, 1):
                    print(f"   {i}. {opt}")
            else:
                print("\nNo optimizations suggested")

        else:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print("Connection Error - Is the backend server running?")
        print("   Start with: cd backend && uvicorn main:app --reload")
    except Exception as e:
        print(f"Test failed: {str(e)}")


if __name__ == "__main__":
    test_explain_code_api()
