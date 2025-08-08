export interface User {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "ACCOUNTANT" | "TECHNICIAN";
  createdAt: string;
  deletedAt?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "ACCOUNTANT" | "TECHNICIAN";
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: "ACCOUNTANT" | "TECHNICIAN";
}

export interface UserListResponse {
  data: User[];
  message: string;
  success: boolean;
}

export interface UserResponse {
  data: User;
  message: string;
  success: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
}
