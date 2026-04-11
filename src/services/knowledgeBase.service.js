import apiClient from './apiClient';

export const uploadDocument = (formData) =>
  apiClient.post('/recruiter/knowledge-base/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getDocuments = (params) =>
  apiClient.get('/recruiter/knowledge-base', { params });

export const getDocument = (id) =>
  apiClient.get(`/recruiter/knowledge-base/${id}`);

export const getStats = () =>
  apiClient.get('/recruiter/knowledge-base/stats');

export const updateDocument = (id, data) =>
  apiClient.patch(`/recruiter/knowledge-base/${id}`, data);

export const retryDocument = (id) =>
  apiClient.post(`/recruiter/knowledge-base/${id}/retry`);

export const deleteDocument = (id) =>
  apiClient.delete(`/recruiter/knowledge-base/${id}`);