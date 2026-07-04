import axios from "axios";

// LAN support: .env mein VITE_API_URL set karo server laptop ka IP
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export default API;