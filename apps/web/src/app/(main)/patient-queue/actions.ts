"use server";

import { ServiceStatus } from "@/types/service";

export interface DeviceInput {
  deviceType: string;
  problemDescription: string;
  accessoriesLeft?: string;
}

export interface CreateServiceData {
  customerId: string;
  devices: DeviceInput[];
}

// Fetch customers for dropdown - client side function
export async function getCustomers(token?: string) {
  if (!token) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/customers`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (res.ok && data.data) {
      return { success: true, customers: data.data };
    }
    return {
      success: false,
      message: data.message || "Gagal memuat customer.",
    };
  } catch {
    return { success: false, message: "Gagal memuat customer." };
  }
}

// List services (patient queue) - client side function
export async function getServices(page = 1, pageSize = 10, token?: string) {
  if (!token) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (res.ok && data.data) {
      return {
        success: true,
        data: data.data,
        total: data.total,
        page,
        pageSize,
        totalPages: data.totalPages,
      };
    }
    return {
      success: false,
      message: data.message || "Gagal memuat antrian pasien.",
    };
  } catch {
    return { success: false, message: "Gagal memuat antrian pasien." };
  }
}

// Create new service - client side function
export async function createService(data: CreateServiceData, token?: string) {
  if (!token) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await res.json();
    if (res.ok && result.data) {
      return { success: true, service: result.data };
    }
    return {
      success: false,
      message: result.message || "Gagal menambah antrian.",
    };
  } catch {
    return { success: false, message: "Gagal menambah antrian." };
  }
}

// Update device status - client side function
export async function updateDeviceStatus(
  id: number,
  status: ServiceStatus,
  token?: string
) {
  if (!token) {
    return { success: false, message: "Authentication required" };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/devices/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    const result = await res.json();
    if (res.ok && result.data) {
      return { success: true, device: result.data };
    }
    return {
      success: false,
      message: result.message || "Gagal update status.",
    };
  } catch {
    return { success: false, message: "Gagal update status." };
  }
}
