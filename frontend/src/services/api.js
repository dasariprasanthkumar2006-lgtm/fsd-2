import axios from 'axios';

// In development, Vite proxies '/api' to 'http://localhost:5000'
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Logs API
export const getDailyLogs = async (date) => {
  const params = date ? { date } : {};
  const response = await api.get('/logs/daily', { params });
  return response.data;
};

export const addFoodLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data;
};

export const deleteFoodLog = async (id) => {
  const response = await api.delete(`/logs/${id}`);
  return response.data;
};

export const getHistoryLogs = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/logs/history', { params });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/logs/analytics');
  return response.data;
};

// Goals API
export const getGoal = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const updateGoal = async (goalData) => {
  const response = await api.post('/goals', goalData);
  return response.data;
};

// Food / Barcode API
export const lookupBarcode = async (barcode) => {
  const response = await api.get(`/foods/barcode/${encodeURIComponent(barcode)}`);
  return response.data;
};

export const searchFoods = async (q) => {
  const response = await api.get('/foods/search', { params: { q } });
  return response.data;
};

// User Profile API
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export default api;
