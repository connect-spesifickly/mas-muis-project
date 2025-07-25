import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { TransactionType, Role } from "@prisma/client";

class TransactionService {
  async list({
    month,
    year,
    sortBy,
    userRole,
  }: {
    month?: number;
    year?: number;
    sortBy?: string;
    userRole?: string;
  }) {
    const where: any = {};
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      where.transactionDate = { gte: start, lte: end };
    }
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: "asc" } : { transactionDate: "asc" },
    });
    if (userRole === Role.OWNER) {
      // Hitung runningBalance
      let runningBalance = 0;
      const result = transactions.map((t) => {
        runningBalance +=
          t.type === TransactionType.INCOME
            ? Number(t.amount)
            : -Number(t.amount);
        return { ...t, runningBalance };
      });
      return result;
    } else {
      // Akuntan: tanpa saldo
      return transactions;
    }
  }
  async create(data: any, userId?: string) {
    // Logika ERP: pembayaran servis, pembelian/penjualan barang, pengeluaran biasa
    return prisma.$transaction(async (tx) => {
      if (data.serviceId) {
        // Pembayaran servis
        const trx = await tx.transaction.create({
          data: { ...data, recordedById: userId, type: TransactionType.INCOME },
        });
        await tx.service.update({
          where: { id: data.serviceId },
          data: { paymentTransaction: { connect: { id: trx.id } } },
        });
        return trx;
      } else if (data.itemId && data.itemQuantity) {
        // Pembelian/penjualan barang
        const trx = await tx.transaction.create({
          data: { ...data, recordedById: userId },
        });
        // Update quantity item
        const item = await tx.item.findUnique({ where: { id: data.itemId } });
        if (!item) throw new ResponseError(404, "Item not found");
        await tx.item.update({
          where: { id: data.itemId },
          data: { quantity: item.quantity + (data.itemQuantity || 0) },
        });
        return trx;
      } else {
        // Pengeluaran operasional biasa
        return tx.transaction.create({
          data: { ...data, recordedById: userId },
        });
      }
    });
  }
}

export default new TransactionService();
