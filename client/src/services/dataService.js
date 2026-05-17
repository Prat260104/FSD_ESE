import api from './api';

export const candidateService = {
  getAll: (params = {}) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`)
};

export const matchService = {
  match: (requirements) => api.post('/match', requirements),
  aiShortlist: (requirements) => api.post('/match/ai/shortlist', requirements),
  interviewQuestions: (data) => api.post('/match/ai/interview-questions', data)
};

export const shortlistService = {
  getAll: (params = {}) => api.get('/shortlists', { params }),
  getById: (id) => api.get(`/shortlists/${id}`),
  save: (data) => api.post('/shortlists', data),
  delete: (id) => api.delete(`/shortlists/${id}`)
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};
