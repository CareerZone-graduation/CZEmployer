import apiClient from '@/services/apiClient';

export const getWorkflows = (params = {}) => apiClient.get('/workflows', { params });
export const getWorkflowById = (workflowId) => apiClient.get(`/workflows/${workflowId}`);
export const createWorkflow = (payload) => apiClient.post('/workflows', payload);
export const updateWorkflow = (workflowId, payload) => apiClient.put(`/workflows/${workflowId}`, payload);
export const deleteWorkflow = (workflowId) => apiClient.delete(`/workflows/${workflowId}`);
export const activateWorkflow = (workflowId) => apiClient.post(`/workflows/${workflowId}/activate`);

export const saveNodesBatch = (workflowId, nodes) => apiClient.post(`/workflows/${workflowId}/nodes/batch`, { nodes });
export const saveConnectionsBatch = (workflowId, connections) => apiClient.post(`/workflows/${workflowId}/connections/batch`, { connections });

export const getWorkflowTemplates = () => apiClient.get('/workflow-templates');
export const getWorkflowTemplateById = (templateId) => apiClient.get(`/workflow-templates/${templateId}`);
export const applyWorkflowTemplate = (templateId, payload) => apiClient.post(`/workflow-templates/${templateId}/apply`, payload);

export const getWorkflowExecutions = (workflowId, params = {}) => apiClient.get(`/workflows/${workflowId}/executions`, { params });
export const retryExecution = (executionId) => apiClient.post(`/workflows/executions/${executionId}/retry`);
export const getFailedExecutionsByApplication = (applicationId) => apiClient.get(`/applications/${applicationId}/failed-executions`);
export const getWorkflowTracking = (workflowId, params = {}) => apiClient.get(`/workflows/${workflowId}/tracking`, { params });
