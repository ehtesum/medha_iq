from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import assessment, admin
from .database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IQ Assessment API", description="API for IQ Assessment Application")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the IQ Assessment API (Bengali version)"}
