from fastapi import FastAPI
from routes.debug import debug_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(debug_router)


@app.get("/")
def root():
    return {"message": "NeuroDebug backend running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)