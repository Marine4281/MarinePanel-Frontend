// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ======================= HELPERS =======================

const normalizeCountryCode = (code) => {
  if (!code || typeof code !== "string") return "us";
  return code.trim().toLowerCase();
};

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    countryCode: normalizeCountryCode(user.countryCode),
  };
};

// ======================= PROVIDER =======================

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem("user");

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(normalizeUser(parsed));
        } catch (err) {
          console.error("Invalid stored user:", err);
          localStorage.removeItem("user");
        }
      }

      try {
        const res = await API.get("/auth/profile", { withCredentials: true });
        if (res.data) {
          const normalized = normalizeUser(res.data);
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);

        // FIX: a confirmed 401 means the session is genuinely dead —
        // keeping stale user/localStorage around made isAuthenticated
        // report true for guests, which then triggered protected-route
        // calls (e.g. /currencies) that always 401'd. Only clear on a
        // real 401 — leave it alone on network errors/5xx so a flaky
        // connection doesn't log someone out.
        if (err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ======================= LOGIN =======================
  // Admin → /admin
  // Everyone else (including child panel owners) → /home

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));

    if (normalized.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  // ======================= LOGOUT =======================

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ======================= UPDATE USER =======================
  // Silently updates user state + localStorage without navigating.
  // Used by ChildPanelActivate and ChildPanelSettings after
  // profile changes that need to reflect immediately in the UI.

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = normalizeUser({ ...prev, ...patch });
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
