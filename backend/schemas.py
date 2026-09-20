from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class UserCreate(BaseModel):
    age: int
    sex: str

class UserResponse(BaseModel):
    id: int
    age: int
    sex: str
    created_at: datetime
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    id: str
    domain: str
    difficulty: float
    discrimination: float
    question_text: str
    image: Optional[str] = None
    choices: List[str]
    correct_answer: str

class QuestionDisplay(BaseModel):
    id: str
    domain: str
    question_text: str
    image: Optional[str] = None
    choices: List[str]

class AnswerSubmit(BaseModel):
    user_id: int
    question_id: str
    answer: str
    response_time: float # in seconds

class TestResultDisplay(BaseModel):
    user_id: int
    estimated_iq: int
    percentile: int
    domains: Dict[str, int]
