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
    let startDate: Date | null = null;

    // 1. Tentukan rentang tanggal dan tanggal mulai (startDate)
    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.transactionDate = { gte: startDate, lte: endDate };
    }

    // 2. Ambil transaksi untuk periode yang dipilih
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: sortBy ? { [sortBy]: "asc" } : { transactionDate: "asc" },
    });

    // 3. Jika user adalah OWNER, hitung running balance yang benar
    if (userRole === Role.OWNER) {
      let openingBalance = 0;

      // 3a. Hitung saldo awal JIKA ada filter tanggal
      if (startDate) {
        // Hitung total semua INCOME sebelum startDate
        const totalIncomeBefore = await prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            transactionDate: { lt: startDate }, // lt = less than
            type: TransactionType.INCOME,
          },
        });

        // Hitung total semua EXPENSE sebelum startDate
        const totalExpenseBefore = await prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            transactionDate: { lt: startDate },
            type: TransactionType.EXPENSE,
          },
        });

        const income = totalIncomeBefore._sum.amount || 0;
        const expense = totalExpenseBefore._sum.amount || 0;

        openingBalance = Number(income) - Number(expense);

        console.log("Opening balance calculation:", {
          startDate,
          income,
          expense,
          openingBalance,
          transactionsCount: transactions.length,
        });
      }

      // 3b. Inisialisasi runningBalance dengan saldo awal
      let runningBalance = openingBalance;

      // 3c. Proses transaksi bulan ini dan tambahkan runningBalance
      const result = transactions.map((t) => {
        const transactionAmount = Number(t.amount);
        if (t.type === TransactionType.INCOME) {
          runningBalance += transactionAmount;
        } else {
          runningBalance -= transactionAmount;
        }

        console.log(
          `Transaction ${t.id}: ${t.type} ${transactionAmount} -> Running Balance: ${runningBalance}`
        );

        return { ...t, runningBalance };
      });

      return result;
    } else {
      // Akuntan atau role lain tidak perlu melihat running balance
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

  async update(id: string, data: any, userId?: string) {
    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      throw new ResponseError(404, "Transaction not found");
    }

    // Update transaction
    return prisma.transaction.update({
      where: { id },
      data: { ...data, recordedById: userId },
    });
  }

  async delete(id: string, userId?: string) {
    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      throw new ResponseError(404, "Transaction not found");
    }

    // Delete transaction
    return prisma.transaction.delete({
      where: { id },
    });
  }
}

export default new TransactionService();
