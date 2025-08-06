import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  timeout: 15000, // 15 second default timeout
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          headers: config.headers,
        }
      );
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        }
      );

      // Add more context to error
      error.message = `Request failed with status ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        `❌ API Network Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          message: "No response received from server",
          request: error.request,
        }
      );

      error.message = "Network error: No response received from server";
    } else {
      // Something else happened
      console.error("❌ API Error:", error.message);
    }

    return Promise.reject(error);
  }
);
