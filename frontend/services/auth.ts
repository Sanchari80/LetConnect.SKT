import api from "../utils/api"; // ✅ ঠিক path

export const signup = (data: any) => api.post("/auth/signup", data);
export const login = (data: any) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/me");