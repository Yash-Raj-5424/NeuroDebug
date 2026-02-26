"""
Auto-retry debugging service.
Implements the Error → Fix → Re-run automatically → Confirm flow.
"""

import time
from typing import List, Optional, Dict, Any
from services.sanitizer import is_code_safe
from services.executor import execute_code
from services.llm_service import generate_fix, BugFixResponse
from services.llm_fallback import generate_fix_fallback


class RetrySession:
    """Tracks state for an auto-retry debugging session."""

    def __init__(self, language: str, initial_code: str, max_attempts: int = 5):
        self.language = language.lower().strip()
        self.initial_code = initial_code
        self.max_attempts = max_attempts
        self.current_code = initial_code
        self.attempts = []
        self.start_time = time.time()
        self.session_id = f"retry_{int(self.start_time * 1000)}"
        self.is_complete = False
        self.success = False

    def add_attempt(self, attempt_data: Dict[str, Any]) -> None:
        """Add an attempt result to the session."""
        self.attempts.append(attempt_data)
        if attempt_data.get("success", False):
            self.success = True
            self.is_complete = True

    def get_session_summary(self) -> Dict[str, Any]:
        """Get a summary of the current session state."""
        return {
            "session_id": self.session_id,
            "language": self.language,
            "initial_code": self.initial_code,
            "current_code": self.current_code,
            "max_attempts": self.max_attempts,
            "total_attempts": len(self.attempts),
            "is_complete": self.is_complete,
            "success": self.success,
            "elapsed_time": time.time() - self.start_time,
            "attempts": self.attempts,
        }


class AutoRetryService:
    """Service for handling auto-retry debugging sessions."""

    def __init__(self):
        self.active_sessions: Dict[str, RetrySession] = {}

    def start_session(
        self, language: str, code: str, max_attempts: int = 5
    ) -> RetrySession:
        """Start a new auto-retry session."""
        session = RetrySession(language, code, max_attempts)
        self.active_sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[RetrySession]:
        """Get an active session by ID."""
        return self.active_sessions.get(session_id)

    def cleanup_session(self, session_id: str) -> bool:
        """Remove a completed session from memory."""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return True
        return False

    def execute_attempt(
        self, session: RetrySession, attempt_number: int
    ) -> Dict[str, Any]:
        """Execute a single attempt in the retry flow."""
        attempt_start = time.time()

        execution_result = execute_code(session.language, session.current_code)

        attempt_data = {
            "attempt_number": attempt_number,
            "code_used": session.current_code,
            "execution_result": execution_result,
            "ai_fix": None,
            "timestamp": attempt_start,
            "success": execution_result["success"],
            "error_message": None,
        }

        if execution_result["success"]:
            session.add_attempt(attempt_data)
            return attempt_data

        # If failed and not the last attempt, get AI fix
        if attempt_number < session.max_attempts:
            error_text = (
                execution_result.get("stderr")
                or execution_result.get("error")
                or "Unknown error"
            )

            ai_fix = self._get_ai_fix(
                session.language, session.current_code, error_text
            )
            attempt_data["ai_fix"] = ai_fix

            if ai_fix and ai_fix.get("fixed_code"):
                session.current_code = ai_fix["fixed_code"]

        session.add_attempt(attempt_data)
        return attempt_data

    def _get_ai_fix(
        self, language: str, code: str, error: str
    ) -> Optional[Dict[str, Any]]:
        """Get an AI fix, trying main service first, then fallback."""
        try:
            # Try main AI service
            ai_suggestion = generate_fix(language, code, error)

            if ai_suggestion and ai_suggestion.fixed_code.strip():
                # Validate safety
                is_safe, reason = is_code_safe(ai_suggestion.fixed_code)

                if is_safe:
                    return {
                        "explanation": ai_suggestion.explanation,
                        "fixed_code": ai_suggestion.fixed_code,
                        "source": "primary",
                    }
                else:
                    # Try fallback if primary is unsafe
                    return self._try_fallback_fix(language, code, error)
            else:
                # Try fallback if primary fails
                return self._try_fallback_fix(language, code, error)

        except Exception as e:
            # Try fallback if primary service throws error
            fallback_result = self._try_fallback_fix(language, code, error)
            if fallback_result:
                return fallback_result

            return {
                "explanation": f"All AI services failed: {str(e)}",
                "fixed_code": "",
                "source": "error",
            }

    def _try_fallback_fix(
        self, language: str, code: str, error: str
    ) -> Optional[Dict[str, Any]]:
        """Try the fallback AI service."""
        try:
            fallback_suggestion = generate_fix_fallback(language, code, error)

            if fallback_suggestion and fallback_suggestion.fixed_code.strip():
                is_safe, reason = is_code_safe(fallback_suggestion.fixed_code)

                if is_safe:
                    return {
                        "explanation": fallback_suggestion.explanation,
                        "fixed_code": fallback_suggestion.fixed_code,
                        "source": "fallback",
                    }

            return None

        except Exception:
            return None

    def run_complete_session(
        self, language: str, code: str, max_attempts: int = 5
    ) -> Dict[str, Any]:
        """Run a complete auto-retry session from start to finish."""
        session = self.start_session(language, code, max_attempts)

        for attempt_num in range(1, max_attempts + 1):
            self.execute_attempt(session, attempt_num)

            if session.is_complete:
                break

        # Mark as complete if we've exhausted attempts
        if not session.is_complete:
            session.is_complete = True

        result = session.get_session_summary()

        # Clean up the session
        self.cleanup_session(session.session_id)

        return result


# Global service instance
auto_retry_service = AutoRetryService()
