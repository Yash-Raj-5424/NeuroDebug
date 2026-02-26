from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.sanitizer import is_code_safe
from services.executor import execute_code
from services.llm_service import generate_fix, explain_code
from services.llm_fallback import generate_fix_fallback
from services.auto_retry_service import auto_retry_service
from typing import List, Optional, Dict, Any
import time

debug_router = APIRouter(prefix="/api")

MAX_CODE_LENGTH = 5000
SUPPORTED_LANGUAGES = {"python", "cpp"}
MAX_RETRY_ATTEMPTS = 5


class DebugRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=20)
    code: str = Field(..., min_length=1, max_length=MAX_CODE_LENGTH)


class AutoRetryRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=20)
    code: str = Field(..., min_length=1, max_length=MAX_CODE_LENGTH)
    max_attempts: Optional[int] = Field(default=MAX_RETRY_ATTEMPTS, ge=1, le=10)


class AttemptResult(BaseModel):
    attempt_number: int
    code_used: str
    execution_result: dict
    ai_fix: Optional[dict]
    timestamp: float
    success: bool


class AutoRetryResponse(BaseModel):
    success: bool
    attempts: List[AttemptResult]
    final_code: str
    total_attempts: int
    execution_time: float
    session_id: str


class ExplainCodeRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=20)
    code: str = Field(..., min_length=1, max_length=MAX_CODE_LENGTH)


class ExplainCodeRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=20)
    code: str = Field(..., min_length=1, max_length=MAX_CODE_LENGTH)


class ExplainCodeResponse(BaseModel):
    explanation: str
    time_complexity: str
    space_complexity: str
    optimizations: List[str]


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


@debug_router.post("/explain-code", response_model=ExplainCodeResponse)
async def explain_my_code(request: ExplainCodeRequest):
    language = request.language.lower().strip()

    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {', '.join(SUPPORTED_LANGUAGES)}",
        )

    is_safe, reason = is_code_safe(request.code)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Unsafe code detected: {reason}")

    try:
        explanation_result = explain_code(language, request.code)

        return ExplainCodeResponse(
            explanation=explanation_result.explanation,
            time_complexity=explanation_result.time_complexity,
            space_complexity=explanation_result.space_complexity,
            optimizations=explanation_result.optimizations,
        )

    except Exception as e:
        raise HTTPException(
            status_code=503, detail=f"Code explanation service failed: {str(e)}"
        )


@debug_router.post("/auto-retry", response_model=AutoRetryResponse)
async def auto_retry_debug(request: AutoRetryRequest):
    language = request.language.lower().strip()

    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {', '.join(SUPPORTED_LANGUAGES)}",
        )

    is_safe, reason = is_code_safe(request.code)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Unsafe code detected: {reason}")

    try:
        session_result = auto_retry_service.run_complete_session(
            language=language, code=request.code, max_attempts=request.max_attempts
        )

        attempts = []
        for attempt in session_result["attempts"]:
            attempts.append(
                AttemptResult(
                    attempt_number=attempt["attempt_number"],
                    code_used=attempt["code_used"],
                    execution_result=attempt["execution_result"],
                    ai_fix=attempt["ai_fix"],
                    timestamp=attempt["timestamp"],
                    success=attempt["success"],
                )
            )

        return AutoRetryResponse(
            success=session_result["success"],
            attempts=attempts,
            final_code=session_result["current_code"],
            total_attempts=session_result["total_attempts"],
            execution_time=session_result["elapsed_time"],
            session_id=session_result["session_id"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-retry failed: {str(e)}")


@debug_router.get("/retry-sessions")
async def get_active_retry_sessions():
    sessions = []
    for session_id, session in auto_retry_service.active_sessions.items():
        sessions.append(session.get_session_summary())

    return {"active_sessions": sessions, "count": len(sessions)}


@debug_router.get("/retry-sessions/{session_id}")
async def get_retry_session(session_id: str):
    session = auto_retry_service.get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session.get_session_summary()


@debug_router.delete("/retry-sessions/{session_id}")
async def cleanup_retry_session(session_id: str):
    success = auto_retry_service.cleanup_session(session_id)

    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": f"Session {session_id} cleaned up successfully"}


@debug_router.post("/quick-fix")
async def quick_fix_code(request: DebugRequest):
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

        try:
            ai_suggestion = generate_fix(
                language=language,
                code=request.code,
                error=error_text,
            )
        except Exception:
            try:
                ai_suggestion = generate_fix_fallback(
                    language=language,
                    code=request.code,
                    error=error_text,
                )
            except Exception as e:
                ai_suggestion = type(
                    "obj",
                    (object,),
                    {
                        "explanation": f"All AI services failed: {str(e)}",
                        "fixed_code": "",
                        "model_dump": lambda: {
                            "explanation": f"All AI services failed: {str(e)}",
                            "fixed_code": "",
                        },
                    },
                )()

    return {
        "message": "Quick fix completed",
        "result": execution_result,
        "ai_fix": ai_suggestion.model_dump() if ai_suggestion else None,
    }
