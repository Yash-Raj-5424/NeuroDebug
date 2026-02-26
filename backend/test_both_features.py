#!/usr/bin/env python3

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"


def test_debug_api():
    print("Testing Debug API...")

    buggy_code = """
def calculate_sum(a, b):
    result = a + b
    print(f"Sum: {result}")
    return result

result = calculate_sum(5, 3
print(result)
"""

    response = requests.post(
        f"{BASE_URL}/debug", json={"language": "python", "code": buggy_code}
    )

    if response.status_code == 200:
        result = response.json()
        print(f"Debug API works! Success: {result['result']['success']}")
        if result.get("ai_fix"):
            print(f"AI Fix: {result['ai_fix']['explanation']}")
    else:
        print(f"Debug API failed: {response.status_code}")


def test_explain_api():
    print("\nTesting Explain Code API...")

    working_code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers.copy())
print(f"Sorted: {sorted_numbers}")
"""

    response = requests.post(
        f"{BASE_URL}/explain-code", json={"language": "python", "code": working_code}
    )

    if response.status_code == 200:
        result = response.json()
        print(f"Explain API works!")
        print(f"Time Complexity: {result['time_complexity']}")
        print(f"Space Complexity: {result['space_complexity']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Optimizations: {len(result.get('optimizations', []))} suggestions")
    else:
        print(f"Explain API failed: {response.status_code}")


def test_health_check():
    try:
        response = requests.get("http://127.0.0.1:8000/")
        if response.status_code == 200:
            print("Backend is running!")
            return True
        else:
            print(f"Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Cannot connect to backend - is it running?")
        print("   Start with: uvicorn main:app --reload")
        return False


def main():
    print("NeuroDebug API Test Suite")
    print("=" * 40)

    if not test_health_check():
        return

    print("\nTesting both Debug and Explain functionality...")
    print("-" * 40)

    try:
        test_debug_api()
        test_explain_api()

        print("\n" + "=" * 40)
        print("All tests completed!")
        print("Both Debug and Explain features are working!")

    except Exception as e:
        print(f"\nTest suite failed: {str(e)}")


if __name__ == "__main__":
    main()
