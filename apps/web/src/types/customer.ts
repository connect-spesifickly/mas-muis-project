export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface CustomerResponse {
  data: Customer;
}

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  page: number;
  limit: number;
}

export interface MergeCustomerData {
  primaryCustomerId: string;
  duplicateCustomerId: string;
}
