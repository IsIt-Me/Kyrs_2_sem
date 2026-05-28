import { apiClient } from './client';

export const hotelApi = {
    getCategories: async () => {
        const response = await apiClient.get('/hotel/categories/');
        return response.data;
    },
    createCategory: async (data) => {
        const response = await apiClient.post('/hotel/categories/', data);
        return response.data;
    },

    deleteCategory: async (categoryId) => {
        await apiClient.delete(`/hotel/categories/${categoryId}/`);
    },

    getRooms: async ({ search = '', category = '', available = '', page = 1, pageSize = 6 } = {}) => {
        const response = await apiClient.get('/hotel/rooms/', {
            params: {
                search: search || undefined,
                category: category || undefined,
                available: available || undefined,
                page,
                page_size: pageSize,
            },
        });

        return response.data;
    },
    createRoom: async (data) => {
        const response = await apiClient.post('/hotel/rooms/', data);
        return response.data;
    },

    deleteRoom: async (roomId) => {
        await apiClient.delete(`/hotel/rooms/${roomId}/`);
    },

    getRoom: async (roomId) => {
        const response = await apiClient.get(`/hotel/rooms/${roomId}/`);
        return response.data;
    },

    getRoomReviews: async (roomId) => {
        const response = await apiClient.get(`/hotel/rooms/${roomId}/reviews/`);
        return response.data;
    },

    createReview: async ({ roomId, rating, text }) => {
        const response = await apiClient.post(`/hotel/rooms/${roomId}/reviews/`, {
            rating,
            text,
        });

        return response.data;
    },

    createBooking: async ({ checkIn, checkOut, roomId }) => {
        const response = await apiClient.post('/hotel/bookings/', {
            check_in: checkIn,
            check_out: checkOut,
            room_id: roomId,
        });

        return response.data;
    },

    getBookings: async () => {
        const response = await apiClient.get('/hotel/bookings/');
        return response.data;
    },

    cancelBooking: async (bookingId) => {
        const response = await apiClient.patch(`/hotel/bookings/${bookingId}/`, {
            action: 'cancel',
        });

        return response.data;
    },

    getFavorites: async () => {
        const response = await apiClient.get('/hotel/favorites/');
        return response.data;
    },

    addFavorite: async (roomId) => {
        const response = await apiClient.post('/hotel/favorites/', {
            room_id: roomId,
        });

        return response.data;
    },

    deleteFavorite: async (favoriteId) => {
        await apiClient.delete(`/hotel/favorites/${favoriteId}/`);
    },
};