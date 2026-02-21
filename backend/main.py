from fastapi import FastAPI
from routes.debug import debug_router

app = FastAPI()

app.include_router(debug_router)


@app.get("/")
def root():
    return {"message": "NeuroDebug backend running"}
