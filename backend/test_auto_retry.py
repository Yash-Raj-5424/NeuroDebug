"""
Test script for the Auto-Retry Debugging System
Demonstrates the Error → Fix → Re-run automatically → Confirm flow
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000/api"


def test_auto_retry_python():
    """Test auto-retry with Python code that has an error."""

    # Code with a simple syntax error
    buggy_code = """
def calculate_sum(a, b):
    result = a + b
    print(f"The sum is: {result}")
    return result

# Call the function with missing closing parenthesis
result = calculate_sum(5, 3
print(result)
"""

    print("🔧 Testing Auto-Retry with Python code...")
    print("=" * 60)
    print("Original buggy code:")
    print(buggy_code)
    print("=" * 60)

    payload = {"language": "python", "code": buggy_code, "max_attempts": 3}

    try:
        response = requests.post(f"{BASE_URL}/auto-retry", json=payload)

        if response.status_code == 200:
            result = response.json()

            print(f"✅ Auto-retry completed!")
            print(f"🎯 Success: {result['success']}")
            print(f"🔄 Total attempts: {result['total_attempts']}")
            print(f"⏱️  Execution time: {result['execution_time']:.2f}s")
            print(f"🆔 Session ID: {result['session_id']}")

            print("\n📋 Attempt Details:")
            for i, attempt in enumerate(result["attempts"], 1):
                print(f"\n--- Attempt {i} ---")
                print(f"Success: {attempt['success']}")

                if attempt["execution_result"]["success"]:
                    print(f"✅ Output: {attempt['execution_result']['stdout']}")
                else:
                    print(
                        f"❌ Error: {attempt['execution_result'].get('stderr', 'Unknown error')}"
                    )

                if attempt["ai_fix"]:
                    print(f"🤖 AI Fix: {attempt['ai_fix']['explanation']}")
                    print(f"🎯 Confidence: {attempt['ai_fix']['confidence']}")

            if result["success"]:
                print("\n🎉 Final working code:")
                print("=" * 40)
                print(result["final_code"])
                print("=" * 40)
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")

    except requests.exceptions.ConnectionError:
        print(
            "❌ Could not connect to backend. Make sure the server is running on localhost:8000"
        )
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")


def test_quick_fix():
    """Test the quick fix functionality."""

    buggy_code = """
def greet(name):
    print(f"Hello {name}!"
    
greet("World")
"""

    print("\n🚀 Testing Quick Fix...")
    print("=" * 60)

    payload = {"language": "python", "code": buggy_code}

    try:
        response = requests.post(f"{BASE_URL}/quick-fix", json=payload)

        if response.status_code == 200:
            result = response.json()
            print("✅ Quick fix completed!")

            if result["ai_fix"]:
                print(f"🤖 AI Suggestion: {result['ai_fix']['explanation']}")
                print(f"🎯 Confidence: {result['ai_fix']['confidence']}")
                print("\n🔧 Suggested fix:")
                print(result["ai_fix"]["fixed_code"])
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend.")
    except Exception as e:
        print(f"❌ Quick fix test failed: {str(e)}")


def test_session_management():
    """Test session management endpoints."""

    print("\n📊 Testing Session Management...")
    print("=" * 60)

    try:
        # Get active sessions
        response = requests.get(f"{BASE_URL}/retry-sessions")
        if response.status_code == 200:
            sessions = response.json()
            print(f"📈 Active sessions: {sessions['count']}")

            for session in sessions["active_sessions"]:
                print(
                    f"Session {session['session_id']}: {session['language']} - {session['success']}"
                )

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend.")
    except Exception as e:
        print(f"❌ Session management test failed: {str(e)}")


def demonstrate_workflow():
    """Demonstrate the complete Error → Fix → Re-run → Confirm workflow."""

    print("🎯 NEURODEBUG AUTO-RETRY SYSTEM DEMO")
    print("=" * 60)
    print("Flow: Error → Fix → Re-run automatically → Confirm")
    print("=" * 60)

    workflows = [
        {
            "name": "Python Syntax Error",
            "code": """
def factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1

# Test the function
print(factorial(5))
""",
            "description": "Missing closing parenthesis",
        },
        {
            "name": "Python Logic Error",
            "code": """
def find_maximum(numbers):
    max_val = 0  # Bug: should be numbers[0] or float('-inf')
    for num in numbers:
        if num > max_val:
            max_val = num
    return max_val

# Test with negative numbers - will fail
result = find_maximum([-5, -2, -8, -1])
print(f"Maximum: {result}")
""",
            "description": "Incorrect initialization of max_val",
        },
    ]

    for i, workflow in enumerate(workflows, 1):
        print(f"\n🔧 Test {i}: {workflow['name']}")
        print(f"🐛 Issue: {workflow['description']}")
        print("-" * 40)

        payload = {"language": "python", "code": workflow["code"], "max_attempts": 4}

        try:
            start_time = time.time()
            response = requests.post(f"{BASE_URL}/auto-retry", json=payload)
            end_time = time.time()

            if response.status_code == 200:
                result = response.json()

                print(f"⏱️  Response time: {end_time - start_time:.2f}s")
                print(f"✅ Success: {result['success']}")
                print(f"🔄 Attempts: {result['total_attempts']}")

                if result["success"]:
                    print("🎉 Code fixed and running successfully!")
                else:
                    print("😞 Could not fix after all attempts")

            else:
                print(f"❌ Request failed: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("❌ Backend not running. Start with: uvicorn main:app --reload")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")

    print(f"\n🎯 Demo completed!")


if __name__ == "__main__":
    print("🚀 Starting NeuroDebug Auto-Retry System Tests...")
    print("Make sure the backend is running: uvicorn main:app --reload")
    print("=" * 80)

    # Run all tests
    test_quick_fix()
    test_auto_retry_python()
    test_session_management()

    print("\n" + "=" * 80)
    demonstrate_workflow()
