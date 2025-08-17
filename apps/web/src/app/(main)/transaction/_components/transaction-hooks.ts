import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
} from "@/types/transaction";

// Interface for customer data
interface Customer {
  id: string;
  name: string;
}

// Function to get customer name by ID
export const getCustomerNameById = (
  customerId: string | number | undefined,
  customerList: Customer[]
) => {
  if (!customerId) return "-";
  const customer = customerList.find((c) => c.id === customerId);
  return customer ? customer.name : "-";
};

// Function to format transaction data for display
export const formatTransactionForDisplay = (
  transaction: Transaction,
  customerList: Customer[]
) => {
  return {
    ...transaction,
    customerId: getCustomerNameById(transaction.customerId, customerList),
    // Add a computed field for amount display with color
    amountDisplay: {
      value: transaction.amount,
      isExpense: transaction.type === "EXPENSE",
    },
  };
};

// Function to handle transaction creation
export const handleCreateTransaction = async (
  data: Partial<Transaction>,
  customerList: Customer[],
  createTransaction: (data: CreateTransactionData) => Promise<void>
) => {
  try {
    // Convert customer name to customerId if customerId is a name
    const transactionData = { ...data };

    // Handle customerId conversion
    if (
      typeof transactionData.customerId === "string" &&
      transactionData.customerId &&
      transactionData.customerId !== "Pilih Customer"
    ) {
      const customer = customerList.find(
        (c) => c.name === transactionData.customerId
      );
      if (customer) {
        transactionData.customerId = customer.id;
      } else {
        // If customer not found, set to undefined (optional field)
        transactionData.customerId = undefined;
      }
    } else {
      // If customerId is empty, undefined, placeholder, or not provided, set to undefined
      transactionData.customerId = undefined;
    }

    // Handle transactionDate format - ExcelTable returns string for date input
    if (transactionData.transactionDate) {
      // ExcelTable returns string for date input, convert to Date
      if (typeof transactionData.transactionDate === "string") {
        transactionData.transactionDate = new Date(
          transactionData.transactionDate + "T12:00:00"
        );
      }
    } else {
      // Set default to current date if not provided
      transactionData.transactionDate = new Date();
    }

    // Ensure amount is a number
    if (typeof transactionData.amount === "string") {
      transactionData.amount = parseFloat(transactionData.amount);
    }

    // Ensure required fields are present
    if (
      !transactionData.description ||
      !transactionData.amount ||
      !transactionData.type
    ) {
      throw new Error("Description, amount, and type are required");
    }

    console.log("Sending transaction data:", transactionData);

    // Clean up data to only send required fields to backend
    const cleanData: CreateTransactionData = {
      description: transactionData.description!,
      amount: transactionData.amount!,
      type: transactionData.type!,
      customerId: transactionData.customerId,
      transactionDate:
        transactionData.transactionDate instanceof Date
          ? transactionData.transactionDate
          : new Date(transactionData.transactionDate),
    };

    await createTransaction(cleanData);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw error; // Re-throw to show error in UI
  }
};

// Function to handle transaction update
export const handleUpdateTransaction = async (
  id: string,
  data: Partial<Transaction>,
  customerList: Customer[],
  updateTransaction: (
    id: string,
    data: Partial<UpdateTransactionData>
  ) => Promise<void>
) => {
  try {
    // Convert customer name to customerId if customerId is a name
    const transactionData = { ...data };

    // Handle customerId conversion
    if (
      typeof transactionData.customerId === "string" &&
      transactionData.customerId &&
      transactionData.customerId !== "Pilih Customer"
    ) {
      const customer = customerList.find(
        (c) => c.name === transactionData.customerId
      );
      if (customer) {
        transactionData.customerId = customer.id;
      } else {
        // If customer not found, set to undefined (optional field)
        transactionData.customerId = undefined;
      }
    } else {
      // If customerId is empty, undefined, placeholder, or not provided, set to undefined
      transactionData.customerId = undefined;
    }

    // Handle transactionDate format - ExcelTable returns string for date input
    if (transactionData.transactionDate) {
      // ExcelTable returns string for date input, convert to Date
      if (typeof transactionData.transactionDate === "string") {
        transactionData.transactionDate = new Date(
          transactionData.transactionDate + "T12:00:00"
        );
      }
    }

    // Ensure amount is a number
    if (typeof transactionData.amount === "string") {
      transactionData.amount = parseFloat(transactionData.amount);
    }

    console.log("Updating transaction data:", transactionData);

    // Clean up data to only send required fields to backend
    const cleanData: Partial<UpdateTransactionData> = {
      ...transactionData,
      transactionDate:
        transactionData.transactionDate instanceof Date
          ? transactionData.transactionDate
          : transactionData.transactionDate
            ? new Date(transactionData.transactionDate)
            : undefined,
    };

    console.log("Clean update data:", cleanData);
    await updateTransaction(id, cleanData);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw error; // Re-throw to show error in UI
  }
};
