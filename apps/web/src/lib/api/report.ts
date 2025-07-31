import { api } from "@/utils/axios";

export const reportApi = {
  getSalesReport: async (
    startDate: string,
    endDate: string,
    token?: string
  ) => {
    const response = await api.get(`/reports/sales`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getProfitReport: async (
    startDate: string,
    endDate: string,
    token?: string
  ) => {
    const response = await api.get(`/reports/profit`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getLossesReport: async (
    startDate: string,
    endDate: string,
    token?: string
  ) => {
    const response = await api.get(`/reports/losses`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getDailyTransactions: async (
    startDate: string,
    endDate: string,
    token?: string
  ) => {
    const response = await api.get(`/reports/daily-transactions`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // New endpoints for financial report
  getMonthlySummary: async (month: number, year: number, token?: string) => {
    console.log("API call: getMonthlySummary", { month, year });
    const response = await api.get(`/reports/monthly-summary`, {
      params: { month, year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response: getMonthlySummary", response.data);
    return response.data;
  },

  getCashPosition: async (month: number, year: number, token?: string) => {
    console.log("API call: getCashPosition", { month, year });
    const response = await api.get(`/reports/cash-position`, {
      params: { month, year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response: getCashPosition", response.data);
    return response.data;
  },

  getCompanyValuation: async (year: number, token?: string) => {
    console.log("API call: getCompanyValuation", { year });
    const response = await api.get(`/reports/company-valuation`, {
      params: { year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response: getCompanyValuation", response.data);
    return response.data;
  },

  getYearlyGraphData: async (token?: string) => {
    console.log("API call: getYearlyGraphData");
    const response = await api.get(`/reports/yearly-graph-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response: getYearlyGraphData", response.data);
    return response.data;
  },

  getMonthlyOmset: async (year: number, token?: string) => {
    console.log("API call: getMonthlyOmset", { year });
    const response = await api.get(`/reports/monthly-omset`, {
      params: { year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response: getMonthlyOmset", response.data);
    return response.data;
  },
};
