import api from './api';

export const employeeService = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`)
};

export const aiService = {
  evaluate: (criteria) => api.post('/ai', criteria),
  aiRecommend: (criteria) => api.post('/ai/recommend', criteria),
  generateFeedback: (data) => api.post('/ai/feedback', data)
};

export const evaluationService = {
  getAll: (params = {}) => api.get('/evaluations', { params }),
  getById: (id) => api.get(`/evaluations/${id}`),
  save: (data) => api.post('/evaluations', data),
  delete: (id) => api.delete(`/evaluations/${id}`)
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};
