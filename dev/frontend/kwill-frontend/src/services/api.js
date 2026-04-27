import axios from "axios";
import { useAuthStore } from '../stores/user_login_state';

const api = axios.create({
    baseURL: "https://localhost:7187"
});

/**
 * Automatically attches each token to every request.
 */
api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;