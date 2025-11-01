import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? "/api"
      : "http://localhost:3000/api",
  withCredentials: true,
});

export default axiosInstance;
