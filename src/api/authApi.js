import api from "./axios.js";

// Register
export const registerUser = (data) => api.post("/auth/register", data);

// Login
export const loginUser = (data) => api.post("/auth/login", data);