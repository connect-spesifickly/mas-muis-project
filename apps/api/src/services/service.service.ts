import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { ServiceStatus } from "@prisma/client";

class ServiceService {
  async list() {
    // Ambil semua service yang masih ada device belum selesai
    return prisma.service.findMany({
      where: {
        devices: {
          some: {
            status: {
              notIn: ["COMPLETED", "RETURNED_TO_CUSTOMER", "CANCELLED"],
            },
          },
        },
      },
      include: {
        customer: true,
        devices: true,
      },
      orderBy: { createdAt: "desc" },
    });
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
    // Update status device
    const device = await prisma.device.findUnique({ where: { id } });
    if (!device) throw new ResponseError(404, "Device not found");
    const updated = await prisma.device.update({
      where: { id },
      data: { status },
    });
    return updated;
  }
}

export default new ServiceService();
