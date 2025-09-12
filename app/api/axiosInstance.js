// axiosInstance.js
import axios from "axios";
import { API_URL } from "../api/config";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ read token from localStorage (not sessionStorage)
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// 🔥 Response interceptor for expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");

      // Optional: redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
