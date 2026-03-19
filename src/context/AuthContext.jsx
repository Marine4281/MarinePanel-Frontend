// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // Make sure this points to your axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // track if user data is loading

  // Load user from localStorage and refresh from backend
  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored)); // keep local copy while fetching
      }

      try {
        const res = await API.get("/auth/profile", { withCredentials: true });
        if (res.data) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        // ❌ Don't clear localStorage here — keep user if it exists
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/home"); // keeps your existing login flow
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading, // expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Custom hook for components
export const useAuthContext = () => useContext(AuthContext);
