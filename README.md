# NeuroDebug

**NeuroDebug** is an AI‑powered debugging assistant for Python. It allows users to submit snippets of Python code through a web interface, safely executes the code on a backend service, and when errors occur, leverages a language model to provide human‑readable explanations and suggested fixes.

---

## 🚀 Features

- **FastAPI backend** that receives and executes Python code in a sandboxed subprocess.
- **Error capture** including compilation errors, runtime exceptions, exit codes, and `stderr` output.
- **LLM integration**: when an error happens the code and error message are sent to a large language model which returns:
  - a plain‑language explanation of what went wrong
  - a corrected version of the code
- **React frontend** with components for code editing, explanation viewing, and debugging actions.
- **Auto‑retry service** to transparently handle transient LLM issues and fallbacks.

> 📌 *Future plans:* migrate sandboxing to Docker containers for stricter isolation and better resource control.

---

## 🗂️ Repository Structure

```
backend/                # FastAPI server and business logic
  main.py               # entry point for the API
  requirements.txt      # Python dependencies
  routes/               # FastAPI route handlers
    debug.py            # /debug endpoint logic
  services/             # reusable backend services
    auto_retry_service.py
    executor.py         # code execution in subprocess
    llm_fallback.py     # multi-model fallback logic
    llm_service.py      # LLM request helpers
    sanitizer.py        # user input cleaning

frontend/               # React client application
  package.json
  public/
  src/
    api/                # client‑side API wrappers
      debugApi.js
    components/         # reusable UI pieces
      CodeEditor.jsx
      DebugButton.jsx
      DiffViewer.jsx
      ExplainButton.jsx
      LanguageSelector.jsx
      OutputPanel.jsx
    pages/              # top‑level pages
      DebugPage.jsx
    styles/             # CSS modules and global styles
    utils/
      errorParser.js    # parse backend error payloads
```

---

## 🛠️ Getting Started

### Prerequisites

- Python 3.10+ (backend)
- Node.js 16+ / npm or yarn (frontend)

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

The API will run at `http://localhost:8000` with a single `/debug` POST endpoint.

### Frontend Setup

```bash
cd frontend
npm install    # or yarn
env-cmd ./start # depending on your preference
npm start
```

Open `http://localhost:3000` in your browser to access the UI.

---

## 🧪 Tests

The backend contains pytest test files to validate features and integration flow.

```bash
cd backend
env\Scripts\activate   # activate the virtual env first
pytest -q
```

- `test_auto_retry.py` – ensures the retry logic works correctly.
- `test_both_features.py` – exercises full debug/LLM cycle.
- `test_explain_code.py` – checks explanation formatting.


---

## 🧩 How It Works

1. **User submits code** via the React editor.
2. **Frontend** sends a request to `POST /debug` with `{ code, language }`.
3. **`executor.py`** spawns a subprocess to run the code and collects errors/output.
4. If execution fails, **`llm_service.py`** sends the payload to the configured language model(s).
5. **`auto_retry_service.py`** handles transient model failures and fallback logic defined in `llm_fallback.py`.
6. **Response** delivered back to the frontend containing the original output, explanation, and fix.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests for enhancements, bug fixes, or general suggestions.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

Please follow the existing code style and add tests for new functionality.

---

## 📜 License

This project is released under the [MIT License](LICENSE) — see the `LICENSE` file for details.

---

## ✨ Credits

Originally created by Karunakar ([github.com/karunakar78](https://github.com/karunakar78)).

Thanks to all contributors and the open‑source community for inspiration and support.
