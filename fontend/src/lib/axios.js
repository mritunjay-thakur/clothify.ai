import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  timeout: 15000,
});

let csrfTokenPromise = null;

const pendingRequests = new Map();

const fetchCsrfToken = async () => {
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = axiosInstance
    .get("/csrf-token", { headers: { Accept: "application/json" } })
    .then((response) => {
      const token = response.data.csrfToken;
      const isProduction = process.env.NODE_ENV === "production";
      document.cookie = `XSRF-TOKEN=${token}; Path=/; Max-Age=86400; SameSite=${
        isProduction ? "None" : "Lax"
      }; ${isProduction ? "Secure" : ""}`;
      return token;
    })
    .catch((err) => {
      console.warn("Failed to fetch CSRF token:", err);
      throw err;
    })
    .finally(() => {
      csrfTokenPromise = null;
    });

  return csrfTokenPromise;
};

axiosInstance.interceptors.request.use(async (config) => {
  const requestId = `${config.method}-${config.url}-${JSON.stringify(
    config.data
  )}`;

  if (pendingRequests.has(requestId)) {
    console.warn("Duplicate request prevented:", requestId);
    return Promise.reject(new axios.Cancel("Duplicate request prevented"));
  }

  pendingRequests.set(requestId, true);
  config.requestId = requestId;

  if (config.url.includes("/ai/clothify")) {
    config.timeout = 30000;
  }
  if (config.url === "/csrf-token") return config;

  const publicEndpoints = [
    "/auth/login",
    "/auth/signup",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/support",
    "/message",
  ];

  const needsCsrf = !publicEndpoints.some((path) => config.url.includes(path));

  if (needsCsrf && !document.cookie.includes("XSRF-TOKEN")) {
    try {
      await fetchCsrfToken();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  const jwtToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1];

  if (jwtToken) {
    config.headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.requestId) {
      pendingRequests.delete(response.config.requestId);
    }
    return response;
  },
  async (error) => {
    if (error.config?.requestId) {
      pendingRequests.delete(error.config.requestId);
    }

    if (error.code === "ERR_NETWORK") {
      console.warn("Network error - backend unavailable");
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: "Network error, please check your connection and try again.",
      });
    }

    if (error.response?.status === 429) {
      const config = error.config;
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 3) {
        config._retryCount++;
        const retryAfter = error.response.headers["retry-after"]
          ? parseInt(error.response.headers["retry-after"]) * 1000
          : Math.pow(2, config._retryCount) * 1000;

        return new Promise((resolve) => {
          setTimeout(() => resolve(axiosInstance(config)), retryAfter);
        });
      }

      return Promise.reject({
        ...error,
        message:
          error.response?.data?.message ||
          `Too many requests. Please try again after ${
            error.response.headers["retry-after"] || 30
          } seconds.`,
      });
    }

    if (error.response?.status === 401) {
      const publicPaths = [
        "/login",
        "/signup",
        "/verify-otp",
        "/reset-password",
        "/support",
      ];
      const isPublicPath = publicPaths.some((path) =>
        window.location.pathname.includes(path)
      );

      if (!isPublicPath) {
        const redirectCount = parseInt(
          localStorage.getItem("redirectCount") || "0",
          10
        );
        if (redirectCount < 1) {
          localStorage.setItem("redirectCount", (redirectCount + 1).toString());
          window.location.replace(
            `/login?session_expired=true&redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export const cancelPendingRequests = () => {
  const source = axios.CancelToken.source();
  return source.cancel("Operation canceled by the user");
};

export default axiosInstance;
