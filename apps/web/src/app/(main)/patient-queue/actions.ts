"use server";

import { ServiceStatus } from "@/lib/prisma";

export interface DeviceInput {
  deviceType: string;
  problemDescription: string;
  accessoriesLeft?: string;
}

export interface CreateServiceData {
  customerId: string;
  devices: DeviceInput[];
}

// Fetch customers for dropdown
export async function getCustomers() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/customers`,
      {
        headers: { "Content-Type": "application/json" },
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
  } catch (error) {
    return { success: false, message: "Gagal memuat customer." };
  }
}

// List services (patient queue)
export async function getServices(page = 1, pageSize = 10) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services?page=${page}&pageSize=${pageSize}`,
      {
        headers: { "Content-Type": "application/json" },
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
  } catch (error) {
    return { success: false, message: "Gagal memuat antrian pasien." };
  }
}

// Create new service
export async function createService(data: CreateServiceData) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  } catch (error) {
    return { success: false, message: "Gagal menambah antrian." };
  }
}

// Update device status
export async function updateDeviceStatus(id: number, status: ServiceStatus) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/devices/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
  } catch (error) {
    return { success: false, message: "Gagal update status." };
  }
}
