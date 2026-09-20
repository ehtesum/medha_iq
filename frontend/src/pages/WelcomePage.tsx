import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { assessmentService } from '../services/api';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<string>('Male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || age < 5 || age > 100) {
      setError('Please enter a valid age (5-100).');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const user = await assessmentService.startTest(Number(age), sex);
      localStorage.setItem('userId', user.id.toString());
      navigate('/assessment');
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page">
      <div className="glass-panel text-center">
        <div className="hero-header">
          <Brain size={64} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto' }} />
          <h1>Advanced IQ Assessment</h1>
          <p>A scientifically based assessment to measure your cognitive skills.</p>
        </div>

        <form onSubmit={handleStart}>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input 
              type="number" 
              id="age" 
              value={age} 
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter your age" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="sex">Gender</label>
            <select 
              id="sex" 
              value={sex} 
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>}

          <button 
            type="submit" 
            className="primary full-width" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Start Assessment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomePage;
