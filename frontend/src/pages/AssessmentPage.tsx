import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService, type Question } from '../services/api';

const DOMAINS = [
  'matrix_reasoning',
  'working_memory',
  'verbal_reasoning',
  'quantitative_reasoning',
  'processing_speed'
];

const DOMAIN_NAMES_EN: Record<string, string> = {
  'matrix_reasoning': 'Matrix Reasoning',
  'working_memory': 'Working Memory',
  'verbal_reasoning': 'Verbal Reasoning',
  'quantitative_reasoning': 'Quantitative Reasoning',
  'processing_speed': 'Processing Speed'
};

const TOTAL_QUESTIONS = 10;

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [domainIndex, setDomainIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  useEffect(() => {
    const idStr = localStorage.getItem('userId');
    if (!idStr) {
      navigate('/');
      return;
    }
    setUserId(Number(idStr));
  }, [navigate]);

  useEffect(() => {
    if (userId === null) return;

    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      
      if (domainIndex >= DOMAINS.length) {
        navigate('/result');
        return;
      }

      try {
        const currentDomain = DOMAINS[domainIndex];
        const nextQ = await assessmentService.getNextQuestion(userId, currentDomain);
        
        if (nextQ) {
          setQuestion(nextQ);
          setStartTime(Date.now());
          setSelectedChoice(null);
          setQuestionNumber(prev => prev + 1);
        } else {
          setDomainIndex(prev => prev + 1);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading question. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [userId, domainIndex, navigate]);

  const fetchNextQuestion = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const currentDomain = DOMAINS[domainIndex];
      const nextQ = await assessmentService.getNextQuestion(userId, currentDomain);
      if (nextQ) {
        setQuestion(nextQ);
        setStartTime(Date.now());
        setSelectedChoice(null);
        setQuestionNumber(prev => prev + 1);
      } else {
        setDomainIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading question. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!question || !userId || !selectedChoice) return;
    setSubmitting(true);
    const responseTime = (Date.now() - startTime) / 1000;
    try {
      await assessmentService.submitAnswer({
        user_id: userId,
        question_id: question.id,
        answer: selectedChoice,
        response_time: responseTime
      });
      await fetchNextQuestion();
    } catch (err) {
       console.error(err);
       setError('Error submitting answer. Please try again.');
       setSubmitting(false);
    }
  };


  if (loading && !question) {
    return (
      <div className="app-container">
        <div className="glass-panel text-center">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const remaining = TOTAL_QUESTIONS - questionNumber;

  return (
    <div className="app-container">
      <div className="glass-panel assessment-page">
        <div className="question-header">
          <span style={{ color: 'var(--text-secondary)' }}>
            Domain: {DOMAIN_NAMES_EN[DOMAINS[domainIndex]]}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>
             Question {questionNumber} of {TOTAL_QUESTIONS} | {remaining} Remaining
          </span>
        </div>

        {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>}

        <div className="question-content">
          <h2 className="question-text">{question.question_text}</h2>
          
          <div className="choices-grid">
            {question.choices.map((choice, idx) => (
              <button
                key={idx}
                className={`choice-btn ${selectedChoice === choice ? 'selected' : ''}`}
                onClick={() => setSelectedChoice(choice)}
                disabled={submitting}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="primary full-width" 
          onClick={handleAnswerSubmit}
          disabled={!selectedChoice || submitting}
          style={{ marginTop: '1rem' }}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;
