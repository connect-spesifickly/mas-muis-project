import { api } from "@/utils/axios";

export const reportApi = {
  // Financial Report APIs
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
