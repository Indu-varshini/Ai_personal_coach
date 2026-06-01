# backend/Dockerfile
FROM python:3.12-slim

# Install OS‑level dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Create a non‑root user
RUN useradd -m appuser
WORKDIR /app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app ./app

# Use non‑root user for security
USER appuser

# Expose FastAPI default port
EXPOSE 8000

# Run uvicorn (no hot‑reload for production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
