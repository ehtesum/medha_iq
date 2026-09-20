from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    sex = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    responses = relationship("Response", back_populates="user")
    results = relationship("Result", back_populates="user")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    domain = Column(String, index=True)
    difficulty = Column(Float)
    discrimination = Column(Float)
    question_text = Column(String)
    image = Column(String, nullable=True)
    choices = Column(String) # JSON string array
    correct_answer = Column(String)

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    is_correct = Column(Boolean)
    response_time = Column(Float)
    
    user = relationship("User", back_populates="responses")
    question = relationship("Question")

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    estimated_iq = Column(Integer)
    matrix_reasoning_iq = Column(Integer)
    working_memory_iq = Column(Integer)
    verbal_reasoning_iq = Column(Integer)
    quantitative_reasoning_iq = Column(Integer)
    processing_speed_iq = Column(Integer)
    percentile = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="results")
