import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me')
};

export const customerApi = {
  getAll: (search = '', options = {}) =>
    api.get('/customers', {
      params: {
        search,
        raw: options.rawDb ? 'true' : undefined
      }
    }),
  exportExcel: (search = '') =>
    api.get('/customers/export/excel', {
      params: { search },
      responseType: 'blob'
    }),
  getById: (id) => api.get(`/customers/${id}`),
  getNotes: (id) => api.get(`/customers/${id}/notes`),
  createNote: (id, data) => api.post(`/customers/${id}/notes`, data),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`)
};

export const auditApi = {
  getAll: (params) => api.get('/audit-logs', { params }),
  clearAll: () => api.delete('/audit-logs')
};

export const securityToolApi = {
  preview: (input) => api.post('/security-tools/preview', { input })
};

export default api;
