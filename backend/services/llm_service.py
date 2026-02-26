import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not set")

client = genai.Client(api_key=api_key)


class BugFixResponse(BaseModel):
    explanation: str
    fixed_code: str


class CodeExplanationResponse(BaseModel):
    explanation: str
    time_complexity: str
    space_complexity: str
    optimizations: list[str]


def generate_fix(language: str, code: str, error: str) -> BugFixResponse:
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
  "fixed_code": "Complete corrected code"
}}

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
            )

    except Exception as e:
        return BugFixResponse(explanation=f"LLM error: {str(e)}", fixed_code="")


def explain_code(language: str, code: str) -> CodeExplanationResponse:
    try:
        prompt = f"""
You are an expert {language} code analyst and optimization specialist.

Analyze this code:
{code}

Provide a comprehensive analysis in this exact JSON format:
{{
  "explanation": "Clear explanation of what this code does, step by step",
  "time_complexity": "Time complexity analysis (e.g., O(n), O(log n), O(n^2))",
  "space_complexity": "Space complexity analysis (e.g., O(1), O(n))", 
  "optimizations": ["List of specific optimization suggestions", "Improvement 2", "Improvement 3"]
}}

Guidelines:
- explanation: Explain the algorithm/logic in plain English
- time_complexity: Analyze worst-case time complexity with reasoning
- space_complexity: Analyze space usage with reasoning  
- optimizations: Provide 2-5 actionable optimization suggestions

Respond ONLY with valid JSON. No markdown or extra text.
"""

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )

        text = response.text.strip()

        try:
            parsed = json.loads(text)
            return CodeExplanationResponse(**parsed)

        except Exception as parse_error:
            return CodeExplanationResponse(
                explanation=f"Failed to parse LLM response: {parse_error}",
                time_complexity="Unable to determine",
                space_complexity="Unable to determine",
                optimizations=["AI analysis failed"],
            )

    except Exception as e:
        return CodeExplanationResponse(
            explanation=f"LLM service error: {str(e)}",
            time_complexity="Unable to determine",
            space_complexity="Unable to determine",
            optimizations=["AI service unavailable"],
        )
