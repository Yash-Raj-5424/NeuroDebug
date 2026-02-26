import subprocess
import tempfile
import os

EXECUTION_TIMEOUT = 3


def execute_python(code: str) -> dict:
    """
    Safely execute Python code in a temporary file.
    """

    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False
        ) as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name

        result = subprocess.run(
            ["python", temp_path],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT,
        )

        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "error": None,
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "",
            "error": "Execution timed out",
        }

    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": "",
            "error": str(e),
        }

    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass


def execute_cpp(code: str) -> dict:
    """
    Compile and run C++ code safely.
    """

    source_path = None
    binary_path = None

    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".cpp", delete=False) as src:
            src.write(code)
            source_path = src.name

        binary_path = source_path.replace(".cpp", "")

        compile_proc = subprocess.run(
            ["g++", source_path, "-o", binary_path],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT,
        )

        if compile_proc.returncode != 0:
            return {
                "success": False,
                "stdout": "",
                "stderr": compile_proc.stderr,
                "error": "Compilation failed",
            }

        run_proc = subprocess.run(
            [binary_path],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT,
        )

        return {
            "success": run_proc.returncode == 0,
            "stdout": run_proc.stdout,
            "stderr": run_proc.stderr,
            "error": None,
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": "",
            "error": "Execution timed out",
        }

    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": "",
            "error": str(e),
        }

    finally:
        for path in (source_path, binary_path):
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass


def execute_code(language: str, code: str) -> dict:
    language = language.lower()

    if language == "python":
        return execute_python(code)
    elif language == "cpp":
        return execute_cpp(code)
    else:
        return {
            "success": False,
            "stdout": "",
            "stderr": "",
            "error": f"Unsupported language: {language}",
        }
