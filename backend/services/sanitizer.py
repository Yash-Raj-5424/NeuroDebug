BLOCKED_KEYWORDS = {
    "import os",
    "import sys",
    "import subprocess",
    "from os",
    "from sys",
    "from subprocess",
    "eval(",
    "exec(",
    "open(",
    "__import__",
    "os.system",
    "subprocess.",
    "shutil.",
    "#include <filesystem>",
    "#include <cstdlib>",
    "system(",
    "popen(",
    "fork(",
}


def is_code_safe(code: str) -> tuple[bool, str | None]:
    """
    Returns:
        (True, None) if safe
        (False, reason) if dangerous
    """
    lowered = code.lower()

    for keyword in BLOCKED_KEYWORDS:
        if keyword in lowered:
            return False, f"Blocked keyword detected: {keyword}"

    return True, None
