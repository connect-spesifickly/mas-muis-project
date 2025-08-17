import prisma from "../prisma";
import { TransactionType, ItemType, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Helper function untuk kejelasan dan menghindari pengulangan kode
const calculateBalance = (
  income: { _sum: { amount: number | Decimal | null } },
  expense: { _sum: { amount: number | Decimal | null } }
) => {
  const totalIncome = Number(income._sum.amount || 0);
  const totalExpense = Number(expense._sum.amount || 0);
  return totalIncome - totalExpense;
};

// Helper function untuk safe database operations dengan retry
const safePrismaOperation = async <T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Database operation failed (attempt ${attempt}/${retries}):`,
        error
      );

      // Check if it's a connection error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isConnectionError =
        errorMessage.includes("Connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("ENOTFOUND");

      if (isConnectionError && attempt < retries) {
        console.log(`Retrying database operation in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }

      // If it's not a connection error or we've exhausted retries, throw immediately
      break;
    }
  }

  // Re-throw with more context
  throw new Error(
    `Database operation failed after ${retries} attempts: ${lastError?.message || "Unknown error"}`
  );
};

class ReportService {
  /**
   * Menghitung ringkasan keuangan untuk bulan tertentu.
   * Efisiensi: Cukup baik. Mengambil semua transaksi bulanan masih wajar.
   * Perbaikan: Logika HPP diperbaiki.
   */
  async monthlySummary(month: number, year: number) {
    try {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      const [incomeResult, expenseResult, hppTransactions] = await Promise.all([
        safePrismaOperation(() =>
          prisma.transaction.aggregate({
            where: {
              transactionDate: { gte: start, lt: end },
              type: TransactionType.INCOME,
            },
            _sum: { amount: true },
          })
        ),
        safePrismaOperation(() =>
          prisma.transaction.aggregate({
            where: {
              transactionDate: { gte: start, lt: end },
              type: TransactionType.EXPENSE,
            },
            _sum: { amount: true },
          })
        ),
        // Mengambil transaksi penjualan barang untuk menghitung HPP
        safePrismaOperation(() =>
          prisma.transaction.findMany({
            where: {
              transactionDate: { gte: start, lt: end },
              type: TransactionType.INCOME, // HPP hanya dari penjualan (pemasukan)
              itemId: { not: null },
            },
            include: {
              item: { select: { purchasePrice: true } }, // Hanya ambil harga beli
            },
          })
        ),
      ]);

      const omset = Number(incomeResult._sum.amount || 0);
      const totalPengeluaran = Number(expenseResult._sum.amount || 0);

      // Perhitungan HPP yang BENAR
      const hpp = hppTransactions.reduce((sum, t) => {
        const costOfGoods =
          Number(t.item?.purchasePrice || 0) * Number(t.itemQuantity || 0);
        return sum + costOfGoods;
      }, 0);

      // Catatan: Laba bersih di sini belum termasuk HPP dari spare part servis.
      // Jika itu dibutuhkan, logikanya harus ditambah.
      const labaBersih = omset - totalPengeluaran - hpp;

      return { omset, totalPengeluaran, hpp, labaBersih };
    } catch (error) {
      console.error("Error in monthlySummary:", error);
      throw error;
    }
  }

  /**
   * Menghitung posisi kas (saldo awal dan akhir) untuk bulan tertentu.
   * Efisiensi: Sangat Tinggi. Semua kalkulasi dilakukan di database.
   */
  async cashPosition(month: number, year: number) {
    try {
      const awalBulan = new Date(year, month - 1, 1);
      const akhirBulan = new Date(year, month, 1);

      const [incomeBefore, expenseBefore, incomeInMonth, expenseInMonth] =
        await Promise.all([
          // Saldo Awal
          safePrismaOperation(() =>
            prisma.transaction.aggregate({
              where: {
                transactionDate: { lt: awalBulan },
                type: TransactionType.INCOME,
              },
              _sum: { amount: true },
            })
          ),
          safePrismaOperation(() =>
            prisma.transaction.aggregate({
              where: {
                transactionDate: { lt: awalBulan },
                type: TransactionType.EXPENSE,
              },
              _sum: { amount: true },
            })
          ),
          // Perubahan Selama Bulan Ini
          safePrismaOperation(() =>
            prisma.transaction.aggregate({
              where: {
                transactionDate: { gte: awalBulan, lt: akhirBulan },
                type: TransactionType.INCOME,
              },
              _sum: { amount: true },
            })
          ),
          safePrismaOperation(() =>
            prisma.transaction.aggregate({
              where: {
                transactionDate: { gte: awalBulan, lt: akhirBulan },
                type: TransactionType.EXPENSE,
              },
              _sum: { amount: true },
            })
          ),
        ]);

      const saldoAwal = calculateBalance(incomeBefore, expenseBefore);
      const changeInMonth = calculateBalance(incomeInMonth, expenseInMonth);
      const saldoAkhir = saldoAwal + changeInMonth;

      return { saldoAwal, saldoAkhir };
    } catch (error) {
      console.error("Error in cashPosition:", error);
      throw error;
    }
  }

  /**
   * Menghitung valuasi perusahaan pada akhir tahun tertentu.
   * Efisiensi: Tinggi. Kalkulasi kas dilakukan di database.
   */
  async companyValuation(year: number) {
    try {
      const end = new Date(year, 11, 31, 23, 59, 59, 999);

      const [income, expense, asetItems, stokItems] = await Promise.all([
        // Hitung total kas di database
        safePrismaOperation(() =>
          prisma.transaction.aggregate({
            where: {
              transactionDate: { lte: end },
              type: TransactionType.INCOME,
            },
            _sum: { amount: true },
          })
        ),
        safePrismaOperation(() =>
          prisma.transaction.aggregate({
            where: {
              transactionDate: { lte: end },
              type: TransactionType.EXPENSE,
            },
            _sum: { amount: true },
          })
        ),
        // Mengambil item masih OK karena jumlahnya lebih sedikit
        safePrismaOperation(() =>
          prisma.item.findMany({
            where: { type: ItemType.ASSET, deletedAt: null },
          })
        ),
        safePrismaOperation(() =>
          prisma.item.findMany({
            where: { type: ItemType.STOCK, deletedAt: null },
          })
        ),
      ]);

      const totalKas = calculateBalance(income, expense);

      const totalNilaiAset = asetItems.reduce(
        (sum, i) =>
          i.createdAt.getFullYear() <= year
            ? sum + Number(i.quantity) * Number(i.purchasePrice)
            : sum,
        0
      );
      const totalNilaiStok = stokItems.reduce(
        (sum, i) =>
          i.createdAt.getFullYear() <= year
            ? sum + Number(i.quantity) * Number(i.purchasePrice)
            : sum,
        0
      );

      const totalValuasi = totalKas + totalNilaiAset + totalNilaiStok;
      return { totalKas, totalNilaiAset, totalNilaiStok, totalValuasi };
    } catch (error) {
      console.error("Error in companyValuation:", error);
      throw error;
    }
  }

  /**
   * Menyediakan data valuasi per tahun untuk grafik.
   * Efisiensi: Sedang ke Tinggi. Loop di server, tapi kalkulasi per tahun efisien.
   */

  async yearlyGraphData() {
    try {
      // Pendekatan ini lebih efisien daripada mengambil semua transaksi
      const firstTransaction = await safePrismaOperation(() =>
        prisma.transaction.findFirst({
          orderBy: { transactionDate: "asc" },
        })
      );
      const lastTransaction = await safePrismaOperation(() =>
        prisma.transaction.findFirst({
          orderBy: { transactionDate: "desc" },
        })
      );

      if (!firstTransaction || !lastTransaction) return [];

      const startYear = firstTransaction.transactionDate.getFullYear();
      const endYear = lastTransaction.transactionDate.getFullYear();

      const resultPromises = [];
      for (let year = startYear; year <= endYear; year++) {
        // Panggil fungsi companyValuation yang sudah efisien
        resultPromises.push(
          this.companyValuation(year).then((valuation) => ({
            year,
            totalValuasi: valuation.totalValuasi,
          }))
        );
      }

      return Promise.all(resultPromises);
    } catch (error) {
      console.error("Error in yearlyGraphData:", error);
      throw error;
    }
  }

  /**
   * Menyediakan data omset per bulan untuk grafik.
   * Efisiensi: Sangat Tinggi. Menggunakan agregasi di database.
   */

  async getMonthlyOmsetPerYear(year: number) {
    try {
      // Loop 12x aggregate, efisien dan mudah dibaca
      const omsetPromises = [];
      for (let month = 1; month <= 12; month++) {
        omsetPromises.push(
          safePrismaOperation(() =>
            prisma.transaction
              .aggregate({
                where: {
                  transactionDate: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                  },
                  type: "INCOME",
                },
                _sum: { amount: true },
              })
              .then((omset) => ({
                month,
                omset: Number(omset._sum.amount || 0),
              }))
          )
        );
      }
      return Promise.all(omsetPromises);
    } catch (error) {
      console.error("Error in getMonthlyOmsetPerYear:", error);
      throw error;
    }
  }
}

export default new ReportService();
