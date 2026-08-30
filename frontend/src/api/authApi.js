import axios from "axios";
import { redirectToLogin } from "../lib/session";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "/api/"
    : "https://webchat-backend-ht0g.onrender.com/api/");

const API = axios.create({
  baseURL,
  // Render free services can take up to about a minute to wake after idle time.
  timeout: 65_000,
});

// Automatically attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A token can expire or become invalid after the backend secret changes. Do not
// leave the app on protected pages repeatedly making unauthorized requests.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default API;
