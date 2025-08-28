import axios from "axios";


const axiosClient = axios.create({
    baseURL: 'ticketing-service/ticketing',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


axiosClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
axiosClient.interceptors.response.use(
    response => response,
    error => {
        if (error.message && error.message.includes('decode')) {
            console.error('Decompression error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
