# backend/models.py
"""
SQLModel models for persisting schedule and activity data.
Why SQLModel?
- Built on top of Pydantic and SQLAlchemy – great for type‑checked data and DB mapping.
- SQLite works out‑of‑the‑box on Windows, no external DB server needed.
- Perfect for a first‑stage MVP that can later be swapped for Postgres.
"""

from datetime import date
from typing import List

from sqlmodel import Field, SQLModel

class Activity(SQLModel, table=False):
    """A single activity entry – stored as a JSON object inside Schedule."""
    title: str
    duration_minutes: int

class Schedule(SQLModel, table=True):
    """Persisted schedule for a given day.
    - `id` is the PK.
    - `schedule_date` is unique – we keep one schedule per day.
    - `focus_areas` and `activities` are stored as JSON strings (SQLModel handles conversion).
    """
    id: int = Field(default=None, primary_key=True)
    schedule_date: date = Field(index=True, description="Date the schedule belongs to")
    focus_areas: List[str] = Field(sa_column_kwargs={"type_": "TEXT"})
    total_minutes: int
    activities: List[Activity] = Field(sa_column_kwargs={"type_": "TEXT"})

    class Config:
        arbitrary_types_allowed = True
