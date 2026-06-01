'''backend/app/coach.py'''
"""Coach module – provides interview question generation and habit tracking.
Why this file?
- Separates concerns: `main.py` stays thin, router logic lives here.
- Demonstrates FastAPI sub‑router usage (a common interview topic).
- Uses simple in‑memory + JSON file persistence for habits, showing file I/O and concurrency handling.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import json
from pathlib import Path
import random
import threading

router = APIRouter()

# ---------------------------------------------------------------------------
# 1️⃣ Interview Questions
# ---------------------------------------------------------------------------
class InterviewQuestion(BaseModel):
    """A single mock interview question.
    - `category` helps you discuss grouping (e.g., "FastAPI", "Data" ).
    - `question` is the text shown to the user.
    """
    category: str = Field(..., description="Topic category, e.g., FastAPI, Data Analysis")
    question: str = Field(..., description="The interview question text")

# A tiny hard‑coded question bank – easy to extend later.
_QUESTION_BANK: List[InterviewQuestion] = [
    InterviewQuestion(category="FastAPI", question="Explain how dependency injection works in FastAPI."),
    InterviewQuestion(category="FastAPI", question="What is the difference between `await` and `async` in a FastAPI endpoint?"),
    InterviewQuestion(category="Data Analysis", question="Describe how you would detect outliers in a pandas DataFrame."),
    InterviewQuestion(category="Data Analysis", question="What is the purpose of the `groupby` operation?"),
    InterviewQuestion(category="GenAI", question="How does retrieval‑augmented generation improve LLM responses?"),
]

@router.get("/interview/question", response_model=InterviewQuestion)
async def get_random_question(category: str | None = None) -> InterviewQuestion:
    """Return a random interview question.
    - If `category` is supplied we filter the bank first – useful for interview‑specific prep.
    - Returns a single `InterviewQuestion` model, which FastAPI automatically documents.
    """
    pool = _QUESTION_BANK
    if category:
        pool = [q for q in _QUESTION_BANK if q.category.lower() == category.lower()]
        if not pool:
            raise HTTPException(status_code=404, detail=f"No questions found for category '{category}'.")
    return random.choice(pool)

# ---------------------------------------------------------------------------
# 2️⃣ Habit Tracking
# ---------------------------------------------------------------------------
# Simple JSON persistence – stored in `backend/data/habits.json`.
_HABIT_FILE = Path(__file__).parent.parent / "data" / "habits.json"
_HABIT_LOCK = threading.Lock()

class HabitEntry(BaseModel):
    """A single habit log entry.
    - `date` in ISO format (YYYY‑MM‑DD).
    - `activity` brief description.
    - `duration_minutes` how long you spent on it.
    """
    date: str = Field(..., description="ISO date, e.g., 2026-06-01")
    activity: str = Field(..., description="What you did, e.g., 'Read FastAPI docs'")
    duration_minutes: int = Field(..., ge=0, description="Minutes spent on the activity")

def _load_habits() -> List[HabitEntry]:
    """Read the JSON file and return a list of HabitEntry objects.
    Returns an empty list if the file does not exist.
    """
    if not _HABIT_FILE.exists():
        return []
    with _HABIT_LOCK, open(_HABIT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [HabitEntry(**item) for item in data]

def _save_habits(entries: List[HabitEntry]) -> None:
    """Write the list of entries back to the JSON file.
    The lock guarantees that two concurrent requests cannot corrupt the file.
    """
    _HABIT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with _HABIT_LOCK, open(_HABIT_FILE, "w", encoding="utf-8") as f:
        json.dump([e.dict() for e in entries], f, indent=2)

@router.post("/habit/log", response_model=HabitEntry)
async def log_habit(entry: HabitEntry) -> HabitEntry:
    """Add a new habit entry.
    - The entry is appended to the JSON store.
    - Returns the stored entry (mirrors what the client sent).
    """
    entries = _load_habits()
    entries.append(entry)
    _save_habits(entries)
    return entry

@router.get("/habit/history", response_model=List[HabitEntry])
async def get_habit_history() -> List[HabitEntry]:
    """Retrieve all logged habit entries.
    Useful for displaying a timeline in the UI.
    """
    return _load_habits()


# ---------------------------------------------------------------------------
# 3️⃣ Coach Questions & Code Feedback
# ---------------------------------------------------------------------------
class CoachQuestion(BaseModel):
    id: int
    text: str
    difficulty: str

_COACH_QUESTIONS: List[CoachQuestion] = [
    CoachQuestion(id=1, text="What is the difference between list and tuple?", difficulty="Easy"),
    CoachQuestion(id=2, text="How does garbage collection work in Python?", difficulty="Medium"),
    CoachQuestion(id=3, text="What are metaclasses and when should you use them?", difficulty="Hard"),
]

@router.get("/coach/questions", response_model=List[CoachQuestion])
async def get_coach_questions(limit: int = 10) -> List[CoachQuestion]:
    """Retrieve mocked questions list for coding prep."""
    return _COACH_QUESTIONS[:limit]


class FeedbackRequest(BaseModel):
    code: str
    language: str

class FeedbackResponse(BaseModel):
    score: int
    comments: List[str]

@router.post("/coach/feedback", response_model=FeedbackResponse)
async def get_code_feedback(req: FeedbackRequest) -> FeedbackResponse:
    """Submit a code snippet and get heuristic feedback."""
    score = min(100, max(0, len(req.code) // 2))
    comments = [
        "Code has correct syntax.",
        f"Good use of {req.language} functions and structures."
    ]
    return FeedbackResponse(score=score, comments=comments)


# ---------------------------------------------------------------------------
# 4️⃣ Dynamic Schedule Generation
# ---------------------------------------------------------------------------
class ScheduleRequest(BaseModel):
    focus_areas: List[str] = Field(..., description="Topics the user wants to study")
    available_hours: int = Field(..., ge=1, le=24, description="Available hours today")

class Activity(BaseModel):
    title: str = Field(..., description="Title of the activity")
    duration_minutes: int = Field(..., description="Duration in minutes")

class ScheduleResponse(BaseModel):
    total_minutes: int = Field(..., description="Total scheduled minutes")
    activities: List[Activity] = Field(..., description="List of generated activities")

@router.post("/schedule", response_model=ScheduleResponse)
async def generate_schedule(req: ScheduleRequest) -> ScheduleResponse:
    """Dynamically generate a study/practice schedule based on focus areas and hours."""
    if not req.focus_areas:
        return ScheduleResponse(total_minutes=0, activities=[])
    
    total_available_minutes = req.available_hours * 60
    num_areas = len(req.focus_areas)
    duration_per_area = total_available_minutes // num_areas
    
    activities = []
    for area in req.focus_areas:
        activities.append(
            Activity(
                title=f"Practice and study {area} concepts",
                duration_minutes=duration_per_area
            )
        )
    
    total_minutes = sum(act.duration_minutes for act in activities)
    return ScheduleResponse(total_minutes=total_minutes, activities=activities)

