import axios from 'axios';

// Update this to match your FastAPI backend URL if different
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  age: number;
  sex: string;
}

export interface Question {
  id: string;
  domain: string;
  question_text: string;
  image: string | null;
  choices: string[];
}

export interface AnswerSubmit {
  user_id: number;
  question_id: string;
  answer: string;
  response_time: number;
}

export interface TestResult {
  user_id: number;
  estimated_iq: number;
  percentile: number;
  domains: Record<string, number>;
}

export const assessmentService = {
  startTest: async (age: number, sex: string): Promise<User> => {
    const response = await api.post('/assessment/start', { age, sex });
    return response.data;
  },

  getNextQuestion: async (userId: number, domain: string): Promise<Question | null> => {
    try {
      const response = await api.get(`/assessment/next/${userId}/${domain}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // No more questions in this domain
      }
      throw error;
    }
  },

  submitAnswer: async (data: AnswerSubmit): Promise<{ status: string; is_correct: boolean }> => {
    const response = await api.post('/assessment/submit', data);
    return response.data;
  },

  finishTest: async (userId: number): Promise<TestResult> => {
    const response = await api.post(`/assessment/finish/${userId}`);
    return response.data;
  },
};

export default api;
