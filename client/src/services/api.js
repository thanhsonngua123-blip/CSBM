import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

function shouldIgnoreUnauthorizedRedirect(config) {
  if (typeof config?.url !== 'string') {
    return false;
  }

  return config.url.includes('/auth/login') || config.url.includes('/auth/me');
}

function handleUnauthorized() {
  window.dispatchEvent(new Event('auth:unauthorized'));

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !shouldIgnoreUnauthorizedRedirect(error.config)) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

export const customerApi = {
  getAll: (search = '', options = {}) =>
    api.get('/customers', {
      params: {
        search,
        page: options.page,
        limit: options.limit
      }
    }),
  exportExcel: (search = '') =>
    api.get('/customers/export/excel', {
      params: { search },
      responseType: 'blob'
    }),
  importExcel: (payload) => api.post('/customers/import/excel', payload),
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
