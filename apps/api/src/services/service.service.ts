import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { ServiceStatus } from "@prisma/client";

class ServiceService {
  async list(page: number = 1, pageSize: number = 10) {
    // Ambil semua service yang masih ada device belum selesai dengan pagination
    const where = {
      devices: {
        some: {
          status: {
            notIn: [
              ServiceStatus.COMPLETED,
              ServiceStatus.RETURNED_TO_CUSTOMER,
              ServiceStatus.CANCELLED,
            ],
          },
        },
      },
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          devices: {
            select: {
              id: true,
              deviceType: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data: services,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  async create(data: {
    customerId: string;
    devices: {
      deviceType: string;
      problemDescription: string;
      accessoriesLeft?: string;
    }[];
  }) {
    // Transaksi DB: buat service dan devices sekaligus
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        throw new ResponseError(404, "Customer not found");
      }
      const service = await tx.service.create({
        data: {
          customerId: data.customerId,
          devices: {
            create: data.devices.map((d) => ({
              deviceType: d.deviceType,
              problemDescription: d.problemDescription,
              accessoriesLeft: d.accessoriesLeft,
            })),
          },
        },
        include: {
          customer: true,
          devices: true,
        },
      });
      return service;
    });
  }
  async updateDeviceStatus(id: number, status: ServiceStatus) {
    try {
      const updatedDevice = await prisma.device.update({
        where: { id },
        data: { status },
      });
      return updatedDevice;
    } catch (error: any) {
      // P2025 adalah kode error Prisma untuk "Record to update not found."
      if (error.code === "P2025") {
        throw new ResponseError(404, "Device not found");
      }
      // Lempar error lain jika bukan karena tidak ditemukan
      throw error;
    }
  }
}

export default new ServiceService();
