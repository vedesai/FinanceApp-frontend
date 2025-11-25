import axios from 'axios';

// Use environment variable if set, otherwise use relative URL (works with nginx proxy)
// For development, use localhost; for production, use relative URL which nginx will proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Investments API
export const investmentsAPI = {
  getAll: () => api.get('/investments'),
  getById: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
  export: async () => {
    const response = await api.get('/investments/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'investments_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// Assets API
export const assetsAPI = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  export: async () => {
    const response = await api.get('/assets/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assets_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// Liabilities API
export const liabilitiesAPI = {
  getAll: () => api.get('/liabilities'),
  getById: (id) => api.get(`/liabilities/${id}`),
  create: (data) => api.post('/liabilities', data),
  update: (id, data) => api.put(`/liabilities/${id}`, data),
  delete: (id) => api.delete(`/liabilities/${id}`),
  export: async () => {
    const response = await api.get('/liabilities/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'liabilities_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// Dashboard API
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
};

export default api;

