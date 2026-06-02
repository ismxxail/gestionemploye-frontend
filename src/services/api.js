import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (email, password) =>
  api.post('/login', { email, password });

export const logout = () => api.post('/logout');

export const getEmployeurs = () => api.get('/employeurs');
export const createEmployeur = (data) => api.post('/employeurs', data);
export const updateEmployeur = (id, data) => api.put(`/employeurs/${id}`, data);
export const deleteEmployeur = (id) => api.delete(`/employeurs/${id}`);

export const getAllConges = () => api.get('/conges');
export const updateCongeStatus = (id, data) => api.put(`/conges/${id}`, data);

export const getMyConges = (employeurId) => api.get(`/conge/${employeurId}`);
export const createConge = (data) => api.post('/conge', data);

export const getAllPresences = () => api.get('/presences');
export const getMyPresences = (employeurId) => api.get(`/presence/${employeurId}`);
export const checkIn = (employeurId) => api.post(`/presence/checkin/${employeurId}`);
export const checkOut = (employeurId) => api.post(`/presence/checkout/${employeurId}`);

export const getWorkDays = () => api.get('/workdays');

export default api;