from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from .. import models, schemas
from ..database import get_db
from ..services.scoring import next_question, estimate_theta, estimate_iq, calculate_percentile

router = APIRouter()

@router.post("/start", response_model=schemas.UserResponse)
def start_test(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(age=user.age, sex=user.sex)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/next/{user_id}/{domain}", response_model=schemas.QuestionDisplay)
def get_next_question(user_id: int, domain: str, db: Session = Depends(get_db)):
    # Get user responses for this domain
    user_responses = db.query(models.Response).join(models.Question).filter(
        models.Response.user_id == user_id,
        models.Question.domain == domain
    ).all()
    
    answered_q_ids = [r.question_id for r in user_responses]
    
    # Calculate current theta for this domain
    response_data = []
    for r in user_responses:
        response_data.append({
            "difficulty": r.question.difficulty,
            "discrimination": r.question.discrimination,
            "is_correct": r.is_correct
        })
    
    current_theta = estimate_theta(response_data)
    
    # Get available questions in this domain
    available_qs = db.query(models.Question).filter(
        models.Question.domain == domain,
        models.Question.id.notin_(answered_q_ids)
    ).all()
    
    if not available_qs:
        raise HTTPException(status_code=404, detail="No more questions in this domain")
        
    qs_dicts = [{"id": q.id, "difficulty": q.difficulty, "discrimination": q.discrimination} for q in available_qs]
    
    # Find next best question
    next_q_info = next_question(current_theta, qs_dicts)
    
    # Fetch full question
    next_q = db.query(models.Question).filter(models.Question.id == next_q_info["id"]).first()
    
    # Parse JSON choices
    choices = json.loads(next_q.choices)
    
    return schemas.QuestionDisplay(
        id=next_q.id,
        domain=next_q.domain,
        question_text=next_q.question_text,
        image=next_q.image,
        choices=choices
    )

@router.post("/submit")
def submit_answer(answer: schemas.AnswerSubmit, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    is_correct = (answer.answer == question.correct_answer)
    
    db_response = models.Response(
        user_id=answer.user_id,
        question_id=answer.question_id,
        is_correct=is_correct,
        response_time=answer.response_time
    )
    db.add(db_response)
    db.commit()
    
    return {"status": "success", "is_correct": is_correct}

@router.post("/finish/{user_id}", response_model=schemas.TestResultDisplay)
def finish_test(user_id: int, db: Session = Depends(get_db)):
    # Calculate scores for all domains
    domains = ["matrix_reasoning", "working_memory", "verbal_reasoning", "quantitative_reasoning", "processing_speed"]
    domain_scores = {}
    total_responses = []
    
    for domain in domains:
        user_responses = db.query(models.Response).join(models.Question).filter(
            models.Response.user_id == user_id,
            models.Question.domain == domain
        ).all()
        
        response_data = []
        for r in user_responses:
            data = {
                "difficulty": r.question.difficulty,
                "discrimination": r.question.discrimination,
                "is_correct": r.is_correct
            }
            response_data.append(data)
            total_responses.append(data)
            
        theta = estimate_theta(response_data)
        domain_scores[domain] = estimate_iq(theta)
        
    overall_theta = estimate_theta(total_responses)
    overall_iq = estimate_iq(overall_theta)
    percentile = calculate_percentile(overall_iq)
    
    # Save result
    db_result = models.Result(
        user_id=user_id,
        estimated_iq=overall_iq,
        matrix_reasoning_iq=domain_scores["matrix_reasoning"],
        working_memory_iq=domain_scores["working_memory"],
        verbal_reasoning_iq=domain_scores["verbal_reasoning"],
        quantitative_reasoning_iq=domain_scores["quantitative_reasoning"],
        processing_speed_iq=domain_scores["processing_speed"],
        percentile=percentile
    )
    db.add(db_result)
    db.commit()
    
    return schemas.TestResultDisplay(
        user_id=user_id,
        estimated_iq=overall_iq,
        percentile=percentile,
        domains=domain_scores
    )
