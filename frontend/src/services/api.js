import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Courses
export const getCourses = () => API.get('/courses');
export const getCourse = (id) => API.get(`/courses/${id}`);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);
export const getEnrolledCourses = () => API.get('/courses/user/enrolled');

// Quizzes
export const getQuizzesByCourse = (courseId) => API.get(`/quizzes/course/${courseId}`);
export const getQuiz = (id) => API.get(`/quizzes/${id}`);
export const getQuizFull = (id) => API.get(`/quizzes/${id}/full`);

// Results
export const submitResult = (data) => API.post('/results', data);
export const getMyResults = () => API.get('/results/my');
export const getResult = (id) => API.get(`/results/${id}`);

// Dashboard
export const getDashboard = () => API.get('/dashboard');

// AI
export const getAIExplanation = (resultId) => API.post('/ai/explain', { resultId });
export const getAIFeedback = () => API.post('/ai/feedback');

export default API;
