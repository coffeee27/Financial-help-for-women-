import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const postMentorChat = (data) => api.post('/mentor/chat', data);
export const postScannerAnalyze = (data) => api.post('/scanner/analyze', data);
export const postBudgetCalculate = (data) => api.post('/budget/calculate', data);
export const getTodayChallenge = () => api.get('/challenge/today');
export const postChallengeAnswer = (data) => api.post('/challenge/answer', data);
export const postOnboardingDream = (data) => api.post('/onboarding/dream', data);
