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
  createdAt?: string | Date; // optional custom join date
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string | Date; // allow editing join date if needed
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
