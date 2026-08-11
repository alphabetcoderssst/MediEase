from fastapi import FastAPI

app = FastAPI(
    title="MediEase Hospital Queue System",
    description="Backend API for MediEase",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "MediEase Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }