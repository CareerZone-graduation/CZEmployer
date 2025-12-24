import apiClient from './apiClient';

const recruiterService = {
    getProfile: async () => {
        const response = await apiClient.get('/recruiters/profile');
        return response.data;
    },

    getCandidateProfile: async (userId, jobId) => {
        const response = await apiClient.get(`/recruiters/candidates/${userId}`, { params: { jobId } });
        return response.data;
    },

    unlockProfile: async (candidateId, jobId) => {
        const response = await apiClient.post('/recruiters/unlock-profile', { candidateId, jobId });
        return response.data;
    },

    getDashboardStats: async (params) => {
        const response = await apiClient.get('/recruiters/dashboard-stats', { params });
        return response.data;
    },


};

export default recruiterService;
