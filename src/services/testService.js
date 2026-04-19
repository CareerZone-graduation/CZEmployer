import apiClient from '@/services/apiClient';

export const getTests = (params = {}) => apiClient.get('/tests', { params });
export const getTestById = (testId) => apiClient.get(`/tests/${testId}`);
export const createTest = (payload) => apiClient.post('/tests', payload);
export const updateTest = (testId, payload) => apiClient.put(`/tests/${testId}`, payload);
export const deleteTest = (testId) => apiClient.delete(`/tests/${testId}`);
export const duplicateTest = (testId) => apiClient.post(`/tests/${testId}/duplicate`);

export const addQuestion = (testId, payload) => apiClient.post(`/tests/${testId}/questions`, payload);
export const updateQuestion = (testId, questionId, payload) => apiClient.put(`/tests/${testId}/questions/${questionId}`, payload);
export const deleteQuestion = (testId, questionId) => apiClient.delete(`/tests/${testId}/questions/${questionId}`);
export const reorderQuestions = (testId, questionIds) => apiClient.post(`/tests/${testId}/questions/reorder`, { questionIds });
