import axios from 'axios';

// Determina el host del backend dinámicamente:
// - Desde localhost    → http://localhost:8080/api
// - Desde 192.168.1.X → http://192.168.1.X:8080/api
// Esto funciona sin importar desde qué dispositivo se acceda, siempre
// que el backend corra en la misma máquina que el servidor de Vite.
const backendHost = window.location.hostname;
const backendPort = 8080;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${backendHost}:${backendPort}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Do not attach the authorization header for the login endpoint
        if (token && config.url !== '/login') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the server responds with 401 (Unauthorized) and we are not on the login request itself
        if (error.response && error.response.status === 401 && error.config && error.config.url !== '/login') {
            // Token likely expired, clear storage and optionally redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
