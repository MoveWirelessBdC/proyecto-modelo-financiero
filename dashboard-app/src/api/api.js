// dashboard-app/src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api' // La URL base de nuestro backend
});

// Este interceptor añade el token de autenticación a cada petición
api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;