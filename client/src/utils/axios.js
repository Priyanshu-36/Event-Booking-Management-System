import axios from "axios";

// Create one Axios instance for communicating with our backend
const api = axios.create({
  baseURL: "http://localhost:5001/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle expired access token
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      // Prevent infinite retry loop
      originalRequest._retry = true;

      try {
        // Refresh token is automatically sent as a cookie
        await api.post("/auth/refresh-token");

        // Retry the original request with the new access token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        window.dispatchEvent(new Event("auth:logout"));
        //It creates a browser event called: auth: logout;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
    //passes the error forward.
  },
);

export default api;
