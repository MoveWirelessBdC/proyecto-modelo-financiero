// dashboard-app/src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api' 
        : `${window.location.protocol}//${window.location.hostname.replace('.replit.dev', '-3001.replit.dev')}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para peticiones - añade el token de autenticación a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`API: Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
            console.log(`API: No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('API: Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para respuestas
api.interceptors.response.use(
    (response) => {
        console.log(`API: ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();
        
        console.error(`API: ❌ ${method} ${url} - Status: ${status}`);
        
        if (status === 401) {
            console.log('API: 401 Unauthorized - Token may be invalid or expired');
            // Solo limpiar token si no estamos en login (para evitar loops)
            if (url !== '/auth/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    console.log('API: Redirecting to login...');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;