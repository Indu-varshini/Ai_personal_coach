import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get('/')
    assert response.status_code == 200
    assert response.json() == {'message': 'Hello, AI Coach!'}

def test_schedule_endpoint_basic():
    payload = {
        "focus_areas": ["FastAPI", "React"],
        "available_hours": 6
    }
    response = client.post('/schedule', json=payload)
    assert response.status_code == 200
    data = response.json()
    # total minutes should be <= available_hours * 60
    assert data['total_minutes'] <= payload['available_hours'] * 60
    # there should be activities for each focus area
    titles = [a['title'] for a in data['activities']]
    assert any('FastAPI' in t for t in titles)
    assert any('React' in t for t in titles)

def test_schedule_endpoint_no_focus():
    payload = {"focus_areas": [], "available_hours": 4}
    response = client.post('/schedule', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['total_minutes'] == 0
    assert data['activities'] == []
