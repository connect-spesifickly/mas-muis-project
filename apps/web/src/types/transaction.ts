export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface Transaction {
  id: string;
  transactionDate: Date;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  description: string;
  amount: number;
  type: TransactionType;
  category?: string;
  serviceId?: number;
  itemId?: string;
  itemQuantity?: number;
  recordedById?: string;
  recordedBy?: {
    id: string;
    name: string;
    role: string;
  };
  runningBalance?: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
}

export interface TransactionResponse {
  data: Transaction;
}

export interface CreateTransactionData {
  transactionDate?: Date;
  customerId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category?: string;
  serviceId?: number;
  itemId?: string;
  itemQuantity?: number;
}

export interface UpdateTransactionData {
  transactionDate?: Date;
  customerId?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  serviceId?: number;
  itemId?: string;
  itemQuantity?: number;
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  sortBy?: string;
  userRole?: string;
}
