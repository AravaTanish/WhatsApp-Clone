import axios from "axios";

const api = axios.create({
  baseURL: "/backend",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login/refresh") &&
      !originalRequest.url.includes("/logout")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "/backend/login/refresh",
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.accessToken;

        // save new token
        localStorage.setItem("token", newAccessToken);

        // retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        // refresh token expired or invalid
        localStorage.removeItem("token");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
