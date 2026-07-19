import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { extractUserFromTokens, isTokenExpired } from "../utils/jwt";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    idToken: null,
    refreshToken: null
  });
  const [loading, setLoading] = useState(true);

  // Load persisted tokens & user session on mount
  useEffect(() => {
    const initAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const idToken = localStorage.getItem("idToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && !isTokenExpired(accessToken)) {
        const userInfo = extractUserFromTokens(accessToken, idToken);
        setUser(userInfo);
        setTokens({ accessToken, idToken, refreshToken });
      } else if (accessToken) {
        // Expired token
        logout(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { accessToken, idToken, refreshToken } = res.data;
        
        localStorage.setItem("accessToken", accessToken);
        if (idToken) localStorage.setItem("idToken", idToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        const userInfo = extractUserFromTokens(accessToken, idToken);
        setUser(userInfo);
        setTokens({ accessToken, idToken, refreshToken });
        
        toast.success(`Welcome back, ${userInfo.name}!`);
        return { success: true, user: userInfo };
      }
      return { success: false, message: res.message };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login failed.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await authService.signUp({ name, email, password });
      if (res.success) {
        toast.success(res.message || "Verification code sent to your email!");
        return res;
      }
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Signup failed.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const confirmSignup = async (email, confirmationCode) => {
    try {
      const res = await authService.confirmSignUp({ email, confirmationCode });
      if (res.success) {
        toast.success("Account verified successfully! Please log in.");
        return res;
      }
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Verification failed.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const adminCreateUser = async (userData) => {
    try {
      const res = await authService.adminCreateUser(userData);
      if (res.success) {
        toast.success(res.message);
        return res;
      }
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to create user.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setTokens({ accessToken: null, idToken: null, refreshToken: null });
    if (showToast) {
      toast.success("Logged out successfully.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        isAuthenticated: !!user && !!tokens.accessToken,
        isAdmin: user?.role === "Admin",
        login,
        signup,
        confirmSignup,
        adminCreateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
