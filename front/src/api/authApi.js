import { apiClient } from './client';

export const authApi = {
    login: async ({ username, password }) => {
        const response = await apiClient.post('/auth/login/', {
            username,
            password,
        });

        return response.data;
    },

    register: async (data) => {
        const response = await apiClient.post('/auth/register/', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile/');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await apiClient.patch('/auth/profile/', data);
        return response.data;
    },
};