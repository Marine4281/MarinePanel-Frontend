// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ✅ SAFE countryCode normalizer (BULLETPROOF)
const normalizeCountryCode = (code) => {
  if (!code || typeof code !== "string") return "us";

  return code.trim().toLowerCase();
};

// ✅ Normalize full user object
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    countryCode: normalizeCountryCode(user.countryCode),
  };
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load user from localStorage and refresh from backend
  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem("user");

      // ✅ Load from localStorage first (FAST UI)
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(normalizeUser(parsed));
        } catch (err) {
          console.error("Invalid stored user:", err);
          localStorage.removeItem("user");
        }
      }

      // 🔄 Fetch fresh data from backend
      try {
        const res = await API.get("/auth/profile", {
          withCredentials: true,
        });

        if (res.data) {
          const normalized = normalizeUser(res.data);

          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        // ❌ Do NOT clear localStorage here (prevents logout flicker)
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔐 LOGIN
  const login = (userData) => {
    const normalized = normalizeUser(userData);

    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));

    navigate("/home");
  };

  // 🚪 LOGOUT
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Optional hook alias
export const useAuthContext = () => useContext(AuthContext);
