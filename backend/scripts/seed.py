import json
import os
import sys

from backend.database import engine, SessionLocal, Base
from backend.models import Question

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(Question).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding questions...")
    file_path = os.path.join(os.path.dirname(__file__), '../data/questions.json')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    for q_data in questions:
        q = Question(
            id=q_data['id'],
            domain=q_data['domain'],
            difficulty=q_data['difficulty'],
            discrimination=q_data['discrimination'],
            question_text=q_data['question_text'],
            image=q_data.get('image'),
            choices=json.dumps(q_data['choices'], ensure_ascii=False),
            correct_answer=q_data['correct_answer']
        )
        db.add(q)
        
    db.commit()
    print("Successfully seeded database!")
    db.close()

if __name__ == "__main__":
    seed_db()
