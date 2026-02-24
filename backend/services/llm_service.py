import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai

# ✅ load env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not set")

# ✅ create client
client = genai.Client(api_key=api_key)


# ✅ response schema
class BugFixResponse(BaseModel):
    explanation: str
    fixed_code: str
    confidence: float


def generate_fix(language: str, code: str, error: str) -> BugFixResponse:
    """
    Ask Gemini to fix the user's code.
    Returns structured BugFixResponse.
    """
    try:
        prompt = f"""
You are an expert {language} debugger.

User code:
{code}

Error:
{error}

Respond ONLY with valid JSON in this format:
{{
  "explanation": "Brief explanation of the issue and fix",
  "fixed_code": "Complete corrected code",
  "confidence": 0.95
}}

The confidence field should be a float between 0.0 and 1.0 indicating your certainty about the fix.
Do not include markdown or extra text.
"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )

        text = response.text.strip()

        try:
            parsed = json.loads(text)
            return BugFixResponse(**parsed)

        except Exception as parse_error:
            return BugFixResponse(
                explanation=f"Failed to parse LLM response: {parse_error}",
                fixed_code="",
                confidence=0.0,
            )

    except Exception as e:
        return BugFixResponse(
            explanation=f"LLM error: {str(e)}", fixed_code="", confidence=0.0
        )
