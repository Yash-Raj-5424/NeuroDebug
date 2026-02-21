from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.sanitizer import is_code_safe
from services.executor import execute_code
from services.llm_service import generate_fix
from services.llm_fallback import generate_fix_fallback

debug_router = APIRouter(prefix="/api")

MAX_CODE_LENGTH = 5000
SUPPORTED_LANGUAGES = {"python", "cpp"}


class DebugRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=20)
    code: str = Field(..., min_length=1, max_length=MAX_CODE_LENGTH)


@debug_router.post("/debug")
async def debug_code(request: DebugRequest):
    language = request.language.lower().strip()

    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {', '.join(SUPPORTED_LANGUAGES)}",
        )

    is_safe, reason = is_code_safe(request.code)

    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Unsafe code detected: {reason}")

    execution_result = execute_code(language, request.code)

    ai_suggestion = None

    if not execution_result["success"]:
        error_text = (
            execution_result.get("stderr")
            or execution_result.get("error")
            or "Unknown error"
        )

        ai_suggestion = generate_fix(
            language=language,
            code=request.code,
            error=error_text,
        )

    return {
        "message": "Execution completed",
        "result": execution_result,
        "ai_fix": ai_suggestion.model_dump() if ai_suggestion else None,
    }
