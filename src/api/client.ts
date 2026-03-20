import axios from 'axios';

const api = axios.create({
    baseURL: 'https://helo.thynxai.cloud',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('helo_med_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401: Clear token if unauthorized (optional but good practice)
            // if (error.response.status === 401) {
            //     localStorage.removeItem('helo_med_token');
            //     window.location.href = '/login';
            // }
            console.error(`API Error [${error.response.status}]:`, error.response.data);
        } else {
            console.error('API Error [No Response]:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
