import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { Prisma } from "@prisma/client";
// import ExcelJS from "exceljs"; // Uncomment jika sudah install exceljs

class CustomerService {
  async list({
    search,
    page,
    limit,
  }: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              address: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            { notes: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);
    return {
      data,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
  async create(data: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  }) {
    const existing = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });
    if (existing) throw new ResponseError(409, "Phone already registered");
    return prisma.customer.create({ data });
  }
  async update(
    id: string,
    data: { name?: string; phone?: string; address?: string; notes?: string }
  ) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new ResponseError(404, "Customer not found");
    return prisma.customer.update({ where: { id }, data });
  }
  async merge(primaryCustomerId: string, duplicateCustomerId: string) {
    return prisma.$transaction(async (tx) => {
      // Update semua service dan transaction ke primary
      await tx.service.updateMany({
        where: { customerId: duplicateCustomerId },
        data: { customerId: primaryCustomerId },
      });
      await tx.transaction.updateMany({
        where: { customerId: duplicateCustomerId },
        data: { customerId: primaryCustomerId },
      });
      // Hapus duplicate
      await tx.customer.delete({ where: { id: duplicateCustomerId } });
      return { success: true, message: "Customer berhasil digabungkan." };
    });
  }
  async downloadReport(id: string) {
    // Ambil data lengkap customer, service, device, dan transaksi
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            devices: true,
          },
        },
        transactions: true,
      },
    });
    if (!customer) throw new ResponseError(404, "Customer not found");
    // Format data agar mudah dipakai frontend untuk export Excel
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      services: customer.services.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        devices: s.devices.map((d) => ({
          deviceType: d.deviceType,
          problemDescription: d.problemDescription,
          accessoriesLeft: d.accessoriesLeft,
          status: d.status,
          completedAt: d.completedAt,
        })),
      })),
      transactions: customer.transactions.map((t) => ({
        id: t.id,
        transactionDate: t.transactionDate,
        description: t.description,
        amount: t.amount,
        type: t.type,
      })),
    };
  }
}

export default new CustomerService();
