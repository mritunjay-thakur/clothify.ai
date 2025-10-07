import { useState, useEffect, useCallback, useRef } from "react";
import {
  signup,
  login,
  logout,
  getAuthUser,
  editProfile,
  resetPassword,
} from "../lib/api";

const authCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000,

  get() {
    if (this.data && Date.now() - this.timestamp < this.ttl) {
      return this.data;
    }
    return null;
  },

  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },

  clear() {
    this.data = null;
    this.timestamp = 0;
  },
};

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const cached = localStorage.getItem("authState");
    return cached ? JSON.parse(cached).isAuthenticated : false;
  });
  const [authUser, setAuthUser] = useState(() => {
    const cached = localStorage.getItem("authState");
    return cached
      ? JSON.parse(cached).authUser
      : { name: "", email: "", avatar: "/default-avatar.png" };
  });

  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef(0);
  const debounceTimeout = 5000;

  const normalizeUserData = (userData) => {
    if (!userData) {
      return { name: "", email: "", avatar: "/default-avatar.png" };
    }
    return {
      name: userData.fullName || userData.email?.split("@")[0] || "Guest",
      email: userData.email || "",
      avatar:
        userData.profilePic ||
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${
          userData.email || "guest"
        }`,
    };
  };

  const checkAuth = useCallback(
    async (force = false) => {
      const cachedAuth = authCache.get();
      if (cachedAuth && !force) {
        setAuthUser(cachedAuth.authUser);
        setIsAuthenticated(cachedAuth.isAuthenticated);
        setLoading(false);
        return cachedAuth.isAuthenticated;
      }

      if (authCheckInProgress.current && !force) return isAuthenticated;
      const now = Date.now();
      if (now - lastAuthCheck.current < debounceTimeout && !force) {
        return isAuthenticated;
      }

      authCheckInProgress.current = true;
      lastAuthCheck.current = now;

      try {
        setLoading(true);
        const { user } = await getAuthUser();
        const normalizedUser = normalizeUserData(user);

        const authState = {
          isAuthenticated: !!user,
          authUser: normalizedUser,
        };
        authCache.set(authState);

        setAuthUser(normalizedUser);
        setIsAuthenticated(!!user);
        localStorage.setItem("authState", JSON.stringify(authState));
        localStorage.setItem("redirectCount", "0");
        return !!user;
      } catch (err) {
        if (err.response?.status === 401) {
          const authState = {
            isAuthenticated: false,
            authUser: normalizeUserData(null),
          };
          authCache.set(authState);

          setIsAuthenticated(false);
          setAuthUser(normalizeUserData(null));
          localStorage.setItem("authState", JSON.stringify(authState));
        }
        return false;
      } finally {
        setLoading(false);
        authCheckInProgress.current = false;
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    const cachedAuth = authCache.get();
    if (cachedAuth) {
      setAuthUser(cachedAuth.authUser);
      setIsAuthenticated(cachedAuth.isAuthenticated);
      setLoading(false);
    }

    const checkAuthWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await checkAuth();
    };
    checkAuthWithDelay();
  }, [checkAuth]);

  useEffect(() => {
    let debounceTimer;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now - lastAuthCheck.current > 300000) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => checkAuth(), 500);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(debounceTimer);
    };
  }, [checkAuth]);

  const handleRequest = async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      authCache.clear();
      await checkAuth(true);
      return result;
    } catch (err) {
      setError(
        err?.response?.status === 429
          ? "Too many requests, please try again later."
          : err?.response?.data?.message || "An error occurred."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    isAuthenticated,
    authUser,
    checkAuth,
    signup: (data) => handleRequest(signup, data),
    login: (data) => handleRequest(login, data),
    getAuthUser: () => handleRequest(getAuthUser),
    editProfile: (data) => handleRequest(editProfile, data),
    resetPassword: (data) => handleRequest(resetPassword, data),
    logout: async () => {
      try {
        await handleRequest(logout);
        authCache.clear();
        setIsAuthenticated(false);
        setAuthUser({ name: "", email: "", avatar: "/default-avatar.png" });
        localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: false,
            authUser: { name: "", email: "", avatar: "/default-avatar.png" },
          })
        );
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Logout error:", err);
        }
        throw err;
      }
    },
  };
};
