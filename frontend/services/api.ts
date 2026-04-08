import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/v1` : "/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        // We will store token in localStorage or similar
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
