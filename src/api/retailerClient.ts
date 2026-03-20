import axios from 'axios';

const retailerApi = axios.create({
    baseURL: 'https://helo.thynxai.cloud',
    headers: {
        'Content-Type': 'application/json',
    },
});

retailerApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('helo_med_retailer_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

retailerApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(`API Error [${error.response.status}]:`, error.response.data);
            if (error.response.status === 401) {
                localStorage.removeItem('helo_med_retailer_token');
            }
        } else {
            console.error('API Error [No Response]:', error.message);
        }
        return Promise.reject(error);
    }
);

export default retailerApi;
