import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080'
});

// 요청 인터셉터 추가
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;