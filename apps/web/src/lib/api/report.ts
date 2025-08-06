import { api } from "@/utils/axios";

export const reportApi = {
  // Financial Report APIs
  getMonthlySummary: async (month: number, year: number, token?: string) => {
    try {
      console.log("API call: getMonthlySummary", { month, year });
      console.log("Token available:", !!token);

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get(`/reports/monthly-summary`, {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("API response: getMonthlySummary", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getMonthlySummary:", error);
      throw error;
    }
  },

  getCashPosition: async (month: number, year: number, token?: string) => {
    try {
      console.log("API call: getCashPosition", { month, year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get(`/reports/cash-position`, {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("API response: getCashPosition", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCashPosition:", error);
      throw error;
    }
  },

  getCompanyValuation: async (year: number, token?: string) => {
    try {
      console.log("API call: getCompanyValuation", { year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get(`/reports/company-valuation`, {
        params: { year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("API response: getCompanyValuation", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCompanyValuation:", error);
      throw error;
    }
  },

  getYearlyGraphData: async (token?: string) => {
    try {
      console.log("API call: getYearlyGraphData");

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get(`/reports/yearly-graph-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000, // 15 second timeout for this heavier operation
      });

      console.log("API response: getYearlyGraphData", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getYearlyGraphData:", error);
      throw error;
    }
  },

  getMonthlyOmset: async (year: number, token?: string) => {
    try {
      console.log("API call: getMonthlyOmset", { year });

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await api.get(`/reports/monthly-omset`, {
        params: { year },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("API response: getMonthlyOmset", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getMonthlyOmset:", error);
      throw error;
    }
  },
};
