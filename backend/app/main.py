# backend/app/main.py
"""
Minimal FastAPI application for the Personal AI Coach MVP.
Why this file?
- Demonstrates the core of the backend – an HTTP API that can be queried by the frontend or other services.
- Uses `async` to show modern, non‑blocking request handling, which is what industry‑standard frameworks (FastAPI, Node.js) expect.
- Keeps the code tiny so you can run it immediately and see the response, a great first step for interview demos.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from .coach import router as coach_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(coach_router)



@app.get("/")
async def root() -> dict:
    """Return a friendly greeting.
    
    The function is `async` because FastAPI treats all path operations as async by default.
    Returning a dict makes FastAPI automatically convert it to JSON (status 200).
    """
    return {"message": "Hello, AI Coach!"}
