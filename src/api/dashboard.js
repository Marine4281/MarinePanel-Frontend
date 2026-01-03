import API from "./axios";

// User
export const getUserDashboard = () => API.get("/users/dashboard");
export const getUserOrders = () => API.get("/orders");
export const getWallet = () => API.get("/wallet");

// Admin
export const getAdminDashboard = () => API.get("/admin/dashboard");
export const getAllUsers = () => API.get("/admin/users");
export const getAllServices = () => API.get("/admin/services");
export const updateServiceCommission = (serviceId, commission) =>
  API.put(`/admin/services/${serviceId}`, { commission });