from backend.app.main import app

# Set root_path so FastAPI correctly processes routes under /api
app.root_path = "/api"
