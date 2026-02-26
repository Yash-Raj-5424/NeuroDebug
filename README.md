# NeuroDebug
An AI-powered Python debugging assistant.

User submits code
        ↓
Backend receives code (FastAPI)
        ↓
Run code safely in sandbox (subprocess)
        ↓
Capture:
   - Compilation errors
   - Runtime errors
   - Exit codes
   - STDERR output
        ↓
If error:
   Send {code + error} to LLM
        ↓
LLM returns:
   - Explanation
   - Fixed code
        ↓
Return response to frontend

Future upgrades: Running codes in docker in the backend instead of subprocess

Karunakar [https://github.com/karunakar78]