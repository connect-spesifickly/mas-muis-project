import { api } from "@/utils/axios";
import type {
  UserListResponse,
  UserResponse,
  CreateUserData,
  UserFilters,
} from "@/types/user";

export const userApi = {
  list: async (params: UserFilters, token?: string) => {
    const response = await api.get<UserListResponse>("/users", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  listDeleted: async (params: UserFilters, token?: string) => {
    const response = await api.get<UserListResponse>("/users/deleted", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  create: async (data: CreateUserData, token?: string) => {
    const response = await api.post<UserResponse>("/users", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  remove: async (id: string, token?: string) => {
    const response = await api.delete(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  restore: async (id: string, token?: string) => {
    const response = await api.patch(
      `/users/${id}/restore`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
