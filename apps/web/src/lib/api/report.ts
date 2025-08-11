import { api } from "@/utils/axios";

// Enhanced retry logic
interface HttpError {
  response?: {
    status?: number;
    data?: unknown;
  };
}

const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: unknown) {
      const httpError = error as HttpError;
      const status = httpError.response?.status;

      // Check if we have a valid status code
      if (typeof status === "number") {
        // Don't retry on authentication errors
        if (status === 401 || status === 403) {
          throw error;
        }

        // Don't retry on client errors (4xx except 401/403)
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      if (i === maxRetries) {
        throw error;
      }

      console.log(
        `Request failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
};
export const reportApi = {
  // Financial Report APIs with improved error handling
  getMonthlySummary: async (month: number, year: number, token?: string) => {
    try {
      console.log("🔄 API call: getMonthlySummary", { month, year });
      console.log("🔑 Token available:", !!token);

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await retryRequest(() =>
        Promise.resolve(
          api.get(`/reports/monthly-summary`, {
            params: { month, year },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 20000, // Increase timeout to 20 seconds
          })
        )
      );

      console.log("✅ API response: getMonthlySummary", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error in getMonthlyOmset:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      throw error;
    }
  },

  getCashPosition: async (month: number, year: number, token?: string) => {
    try {
      console.log("🔄 API call: getCashPosition", { month, year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await retryRequest(() =>
        Promise.resolve(
          api.get(`/reports/cash-position`, {
            params: { month, year },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 20000,
          })
        )
      );

      console.log("✅ API response: getCashPosition", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error in getMonthlyOmset:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      throw error;
    }
  },

  getCompanyValuation: async (year: number, token?: string) => {
    try {
      console.log("🔄 API call: getCompanyValuation", { year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await retryRequest(() =>
        Promise.resolve(
          api.get(`/reports/company-valuation`, {
            params: { year },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 20000,
          })
        )
      );

      console.log("✅ API response: getCompanyValuation", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error in getMonthlyOmset:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      throw error;
    }
  },

  getYearlyGraphData: async (token?: string) => {
    try {
      console.log("🔄 API call: getYearlyGraphData");

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await retryRequest(() =>
        Promise.resolve(
          api.get(`/reports/yearly-graph-data`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000, // Increase timeout to 30 seconds for heavy operation
          })
        )
      );

      console.log("✅ API response: getYearlyGraphData", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error in getMonthlyOmset:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      throw error;
    }
  },

  getMonthlyOmset: async (year: number, token?: string) => {
    try {
      console.log("🔄 API call: getMonthlyOmset", { year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await retryRequest(() =>
        Promise.resolve(
          api.get(`/reports/monthly-omset`, {
            params: { year },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 20000,
          })
        )
      );

      console.log("✅ API response: getMonthlyOmset", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Error in getMonthlyOmset:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
      }

      throw error;
    }
  },
};
