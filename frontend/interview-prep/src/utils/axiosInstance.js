import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://interview-prep-buddy-fowzan2744s-projects.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',

    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        else if (error.response.status === 500)
        {
            console.log("Error:", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
