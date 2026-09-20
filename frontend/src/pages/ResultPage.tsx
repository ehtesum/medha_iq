import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService, type TestResult } from '../services/api';

const DOMAIN_NAMES_EN: Record<string, string> = {
  'matrix_reasoning': 'Matrix Reasoning',
  'working_memory': 'Working Memory',
  'verbal_reasoning': 'Verbal Reasoning',
  'quantitative_reasoning': 'Quantitative Reasoning',
  'processing_speed': 'Processing Speed'
};

const getFamousComparison = (iq: number) => {
  if (iq >= 140) return { title: "Genius / Near Genius", person: "Albert Einstein or Stephen Hawking" };
  if (iq >= 130) return { title: "Very Superior", person: "Arnold Schwarzenegger or Nicole Kidman" };
  if (iq >= 120) return { title: "Superior", person: "John F. Kennedy or a typical College Graduate" };
  if (iq >= 110) return { title: "High Average", person: "a typical High School Graduate" };
  return { title: "Average", person: "the general population" };
};

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const idStr = localStorage.getItem('userId');
      if (!idStr) {
        navigate('/');
        return;
      }

      try {
        const res = await assessmentService.finishTest(Number(idStr));
        setResult(res);
      } catch (err) {
        console.error(err);
        setError('Error generating results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="glass-panel text-center">
          <div className="spinner"></div>
          <p>Calculating results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="app-container">
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--error-color)' }}>{error || 'Unknown error'}</p>
          <button className="primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const comparison = getFamousComparison(result.estimated_iq);

  return (
    <div className="app-container">
      <div className="glass-panel result-page">
        <div className="hero-header" style={{ marginBottom: '1rem' }}>
          <h1>Your Results</h1>
          <p>Your cognitive profile is outlined below:</p>
        </div>

        <div className="result-score">
          <h2>Estimated IQ</h2>
          <div className="iq-value">{result.estimated_iq}</div>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Percentile: {result.percentile}th
          </p>
        </div>
        
        <div className="comparison-section" style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid var(--primary-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          margin: '2rem 0',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>You think like...</h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            <strong>{comparison.person}</strong>
          </p>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Category: {comparison.title}
          </span>
        </div>

        <div style={{ marginBottom: '1rem', fontWeight: 500 }}>
          Domain Scores:
        </div>
        
        <div className="domain-scores">
          {Object.entries(result.domains).map(([domain, score]) => (
            <div key={domain} className="domain-item">
              <span className="domain-name">{DOMAIN_NAMES_EN[domain] || domain}</span>
              <span className="domain-value">{score}</span>
            </div>
          ))}
        </div>

        <button 
          className="full-width" 
          style={{ marginTop: '2rem' }}
          onClick={() => {
            localStorage.removeItem('userId');
            navigate('/');
          }}
        >
          Start New Test
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
