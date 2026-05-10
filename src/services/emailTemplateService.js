import apiClient from './apiClient';

export const getTemplates = async () => {
  return apiClient.get('/email-templates');
};

export const createTemplate = async (data) => {
  return apiClient.post('/email-templates', data);
};

export const updateTemplate = async (id, data) => {
  return apiClient.put(`/email-templates/${id}`, data);
};

export const deleteTemplate = async (id) => {
  return apiClient.delete(`/email-templates/${id}`);
};
