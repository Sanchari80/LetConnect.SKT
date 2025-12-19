import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ✅ must include /api
  withCredentials: true,
});

export default api;