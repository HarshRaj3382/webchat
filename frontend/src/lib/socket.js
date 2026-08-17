import { io } from "socket.io-client";

const defaultApiUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/"
    : "https://webchat-backend-ht0g.onrender.com/api/";

const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, "");

export const createMessengerSocket = () =>
  io(socketUrl, {
    autoConnect: false,
    auth: { token: localStorage.getItem("token") },
    transports: ["websocket", "polling"],
  });
