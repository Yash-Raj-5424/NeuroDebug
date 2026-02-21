import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI

# ✅ load env
load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY not set")

# ✅ OpenRouter client
client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
)


# ✅ shared response schema
class BugFixResponse(BaseModel):
    explanation: str
    fixed_code: str


def generate_fix_fallback(language: str, code: str, error: str) -> BugFixResponse:
    """
    Fallback LLM using Arcee Trinity Large Preview (free).
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
  "explanation": "...",
  "fixed_code": "..."
}}

Do not include markdown or extra text.
"""

        response = client.chat.completions.create(
            model="arcee-ai/trinity-large-preview:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        if not response.choices:
            return BugFixResponse(
                explanation="Fallback LLM returned no response",
                fixed_code="",
            )

        text = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(text)
            return BugFixResponse(**parsed)

        except Exception as parse_error:
            return BugFixResponse(
                explanation=f"Fallback parse failed: {parse_error}",
                fixed_code="",
            )

    except Exception as e:
        return BugFixResponse(
            explanation=f"Fallback LLM error: {str(e)}",
            fixed_code="",
        )