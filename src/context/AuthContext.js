import React, { createContext, useState, useContext, useEffect } from "react";
import { tokenManager } from "../utils/tokenManager";
import { authAPI } from "../api/apiService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: Check for existing session
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken();
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user data", e);
          // If corrupted, clear
          localStorage.removeItem("user");
          tokenManager.removeToken();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData) => {
    console.log("DEBUG: AuthContext login called with:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    tokenManager.removeToken();
    try {
      authAPI.logout().catch(err => console.warn("Logout API failed", err));
    } catch (e) {
      // Ignore
    }
  };

  const switchRole = (phone, newRole) => {
    // Logic for role switching would technically require re-authentication or backend support.
    // For now, we just update the local user object if permitted.
    // Real implementation should probably hit an API.
    if (user) {
      // This is a simplified "mock-like" behavior for role switching on frontend
      // But ideally this should be an API call: /auth/switch-role
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      return updatedUser;
    }
  };

  const isAuthenticated = !!user;
  // Determine role from is_super_admin flag or role field
  const userRole = user?.is_super_admin ? "SUPERADMIN" : (user?.role || null);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (user.role === "OWNER") return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, userRole, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
