import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI

# Import the FastAPI app (which should include the coach router)
from backend.app.main import app

@pytest.mark.asyncio
async def test_get_questions():
    """Validate that /coach/questions returns mocked questions list."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/coach/questions?limit=2")
    assert response.status_code == 200, "Expected 200 OK"
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    # Check that required fields exist
    for item in data:
        assert "id" in item
        assert "text" in item
        assert "difficulty" in item

@pytest.mark.asyncio
async def test_feedback_endpoint():
    """Submit a small code snippet and verify deterministic feedback response."""
    payload = {
        "code": "def hello():\n    return \"hi\"",
        "language": "python"
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/coach/feedback", json=payload)
    assert response.status_code == 200, "Expected 200 OK"
    data = response.json()
    # Score should be deterministic based on length heuristic in coach.py
    expected_score = min(100, max(0, len(payload["code"]) // 2))
    assert data["score"] == expected_score
    # Comments list should contain two items
    assert isinstance(data["comments"], list)
    assert len(data["comments"]) == 2
    # Verify that at least one comment mentions functions (as per coach logic)
    assert any("functions" in comment.lower() for comment in data["comments"])
