import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEV_MACHINE_IP = "172.25.129.112";

const LOCAL_API_URL =
  Platform.OS === "web"
    ? "http://localhost:5001/api"
    : `http://${DEV_MACHINE_IP}:5001/api`;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;

console.log("========================================");
console.log("🔧 API CONFIG");
console.log("Platform:", Platform.OS);
console.log("Base URL:", API_BASE_URL);
console.log("========================================");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// ================================
// REQUEST INTERCEPTOR
// ================================

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("\n🚀 API REQUEST");
    console.log("Method:", config.method?.toUpperCase());
    console.log("URL:", `${config.baseURL}${config.url}`);
    console.log("Content-Type:", config.headers["Content-Type"]);

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ================================
// RESPONSE INTERCEPTOR
// ================================

api.interceptors.response.use(
  (response) => {
    console.log("\n✅ API RESPONSE");
    console.log("Status:", response.status);
    console.log("URL:", response.config?.url);

    return response;
  },

  (error) => {
    console.error("\n❌ API ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);

    return Promise.reject(error);
  }
);

// ================================
// REPORTS
// ================================

export const reportsAPI = {
  getReports: () => api.get("/reports"),

  createReport: (formData) =>
    api.post("/reports", formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    }),

  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// ================================
// AUTH
// ================================

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),

  register: (userData) => api.post("/auth/register", userData),
};

// ================================
// DETECTION
// ================================

export const detectAPI = {
  detect: async (formData) => {
    console.log("\n========================================");
    console.log("🤖 DETECTION REQUEST");
    console.log("========================================");

    console.log("URL:", `${API_BASE_URL}/detect`);

    console.log("FormData:", formData);

    try {
      const response = await api.post("/detect", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },

        // Keep FormData untouched
        transformRequest: [(data) => data],
      });

      console.log("✅ DETECTION SUCCESS");
      console.log("Status:", response.status);
      console.log("Data:", response.data);

      return response;
    } catch (error) {
      console.error("\n========================================");
      console.error("❌ DETECTION FAILED");
      console.error("========================================");

      console.error("Message:", error.message);

      console.error("Code:", error.code);

      console.error("Status:", error.response?.status);

      console.error("Response:", error.response?.data);

      console.error(
        "Request Content-Type:",
        error.config?.headers?.["Content-Type"]
      );

      throw error;
    }
  },
};

export default api;
