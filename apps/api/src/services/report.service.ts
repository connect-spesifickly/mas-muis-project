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

class ReportService {
  /**
   * Menghitung ringkasan keuangan untuk bulan tertentu.
   * Efisiensi: Cukup baik. Mengambil semua transaksi bulanan masih wajar.
   * Perbaikan: Logika HPP diperbaiki.
   */
  async monthlySummary(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [incomeResult, expenseResult, hppTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          transactionDate: { gte: start, lte: end },
          type: TransactionType.INCOME,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          transactionDate: { gte: start, lte: end },
          type: TransactionType.EXPENSE,
        },
        _sum: { amount: true },
      }),
      // Mengambil transaksi penjualan barang untuk menghitung HPP
      prisma.transaction.findMany({
        where: {
          transactionDate: { gte: start, lte: end },
          type: TransactionType.INCOME, // HPP hanya dari penjualan (pemasukan)
          itemId: { not: null },
        },
        include: {
          item: { select: { purchasePrice: true } }, // Hanya ambil harga beli
        },
      }),
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
  }

  /**
   * Menghitung posisi kas (saldo awal dan akhir) untuk bulan tertentu.
   * Efisiensi: Sangat Tinggi. Semua kalkulasi dilakukan di database.
   */
  async cashPosition(month: number, year: number) {
    const awalBulan = new Date(year, month - 1, 1);
    const akhirBulan = new Date(year, month, 0, 23, 59, 59, 999);

    const [incomeBefore, expenseBefore, incomeInMonth, expenseInMonth] =
      await Promise.all([
        // Saldo Awal
        prisma.transaction.aggregate({
          where: {
            transactionDate: { lt: awalBulan },
            type: TransactionType.INCOME,
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            transactionDate: { lt: awalBulan },
            type: TransactionType.EXPENSE,
          },
          _sum: { amount: true },
        }),
        // Perubahan Selama Bulan Ini
        prisma.transaction.aggregate({
          where: {
            transactionDate: { gte: awalBulan, lte: akhirBulan },
            type: TransactionType.INCOME,
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            transactionDate: { gte: awalBulan, lte: akhirBulan },
            type: TransactionType.EXPENSE,
          },
          _sum: { amount: true },
        }),
      ]);

    const saldoAwal = calculateBalance(incomeBefore, expenseBefore);
    const changeInMonth = calculateBalance(incomeInMonth, expenseInMonth);
    const saldoAkhir = saldoAwal + changeInMonth;

    return { saldoAwal, saldoAkhir };
  }

  /**
   * Menghitung valuasi perusahaan pada akhir tahun tertentu.
   * Efisiensi: Tinggi. Kalkulasi kas dilakukan di database.
   */
  async companyValuation(year: number) {
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const [income, expense, asetItems, stokItems] = await Promise.all([
      // Hitung total kas di database
      prisma.transaction.aggregate({
        where: { transactionDate: { lte: end }, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { transactionDate: { lte: end }, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      // Mengambil item masih OK karena jumlahnya lebih sedikit
      prisma.item.findMany({
        where: { type: ItemType.ASSET, deletedAt: null },
      }),
      prisma.item.findMany({
        where: { type: ItemType.STOCK, deletedAt: null },
      }),
    ]);

    const totalKas = calculateBalance(income, expense);

    const totalNilaiAset = asetItems.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.purchasePrice),
      0
    );
    const totalNilaiStok = stokItems.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.purchasePrice),
      0
    );

    const totalValuasi = totalKas + totalNilaiAset + totalNilaiStok;
    return { totalKas, totalNilaiAset, totalNilaiStok, totalValuasi };
  }

  /**
   * Menyediakan data valuasi per tahun untuk grafik.
   * Efisiensi: Sedang ke Tinggi. Loop di server, tapi kalkulasi per tahun efisien.
   */
  async yearlyGraphData() {
    // Pendekatan ini lebih efisien daripada mengambil semua transaksi
    const firstTransaction = await prisma.transaction.findFirst({
      orderBy: { transactionDate: "asc" },
    });
    const lastTransaction = await prisma.transaction.findFirst({
      orderBy: { transactionDate: "desc" },
    });

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
  }

  /**
   * Menyediakan data omset per bulan untuk grafik.
   * Efisiensi: Sangat Tinggi. Menggunakan agregasi di database.
   */
  async getMonthlyOmsetPerYear(year: number) {
    // Loop 12x aggregate, efisien dan mudah dibaca
    const omsetPromises = [];
    for (let month = 1; month <= 12; month++) {
      omsetPromises.push(
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
          .then((omset) => ({ month, omset: Number(omset._sum.amount || 0) }))
      );
    }
    return Promise.all(omsetPromises);
  }
}

export default new ReportService();
