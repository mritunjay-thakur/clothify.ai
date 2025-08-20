import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  try {
    const csrfResponse = await axiosInstance.get("/csrf-token");
    const csrfToken = csrfResponse.data.csrfToken;

    const response = await axiosInstance.post("/auth/signup", {
      ...signupData,
      csrfToken,
    });
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Signup failed."
    );
  }
};

export const getAuthStatus = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return { isAuthenticated: !!res.data?.user, user: res.data?.user || null };
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(
        error.response?.data?.message ||
          `Too many requests, please try again after ${
            error.response.headers["retry-after"] || 30
          } seconds.`
      );
    }
    return { isAuthenticated: false, user: null };
  }
};

export const login = async (loginData) => {
  try {
    const csrfResponse = await axiosInstance.get("/csrf-token");
    const csrfToken = csrfResponse.data.csrfToken;

    const response = await axiosInstance.post("/auth/login", {
      ...loginData,
      csrfToken,
    });
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Login failed."
    );
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "OTP verification failed."
    );
  }
};

export const resendOtp = async ({ userId, context }) => {
  try {
    const response = await axiosInstance.post("/auth/resend-otp", {
      userId,
      context,
    });
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Resend OTP failed."
    );
  }
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(
        error.response?.data?.message ||
          `Too many requests, please try again after ${
            error.response.headers["retry-after"] || 30
          } seconds.`
      );
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    document.cookie =
      "jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
    document.cookie =
      "XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Logout failed:", error);
    }
    throw error;
  }
};

export const completeEditProfile = async (userData) => {
  try {
    const response = await axiosInstance.put("/auth/profile", userData);
    return response.data;
  } catch (err) {
    const serverMessage = err.response?.data?.message;
    const defaultMessage = "Profile update failed.";

    if (err.response?.status === 429) {
      throw new Error(
        serverMessage ||
          `Too many requests. Please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
      );
    }

    throw new Error(serverMessage || defaultMessage);
  }
};

export const askClothifyAI = async (messages) => {
  try {
    const res = await axiosInstance.post("/ai/clothify", { messages });
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "AI request failed."
    );
  }
};

export const getUserChats = async () => {
  try {
    const res = await axiosInstance.get("/chats/");
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to fetch chats."
    );
  }
};

export const getUserConversations = async () => {
  try {
    const res = await axiosInstance.get("/conversations");
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to fetch conversations."
    );
  }
};

export const createConversation = async (initialMessage) => {
  try {
    const res = await axiosInstance.post("/conversations", { initialMessage });
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to create conversation."
    );
  }
};

export const addMessageToConversation = async (conversationId, message) => {
  try {
    const res = await axiosInstance.post(
      `/conversations/${conversationId}/messages`,
      { message }
    );
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to add message."
    );
  }
};

export const getConversationById = async (conversationId) => {
  try {
    const res = await axiosInstance.get(`/conversations/${conversationId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to fetch conversation."
    );
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const res = await axiosInstance.delete(`/conversations/${conversationId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Failed to delete conversation."
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const csrfResponse = await axiosInstance.get("/csrf-token");
    const csrfToken = csrfResponse.data.csrfToken;
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
      csrfToken,
    });
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Forgot password request failed."
    );
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  } catch (err) {
    let errorMessage = err?.response?.data?.message || "Reset password failed.";

    if (err?.response?.status === 404) {
      errorMessage = "Session expired. Please request a new reset link.";
    } else if (err?.response?.status === 400) {
      errorMessage = "Invalid or expired OTP. Please request a new code.";
    } else if (err?.response?.status === 429) {
      errorMessage =
        err?.response?.data?.message ||
        `Too many requests, please try again after ${
          err.response.headers["retry-after"] || 30
        } seconds.`;
    }

    throw new Error(errorMessage);
  }
};

export const sendSupportMessage = async (data) => {
  try {
    const response = await axiosInstance.post("/message", data);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.status === 429
        ? err?.response?.data?.message ||
          `Too many requests, please try again after ${
            err.response.headers["retry-after"] || 30
          } seconds.`
        : err?.response?.data?.message || "Support message failed."
    );
  }
};
