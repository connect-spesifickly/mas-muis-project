import { Transaction } from "@/types/transaction";
import { toast } from "sonner";

export const handleExportExcel = async (
  transactions: Transaction[],
  customers: { id: string; name: string }[]
) => {
  try {
    const XLSX = await import("xlsx");

    // Format data untuk export
    const exportData = transactions.map((transaction) => {
      const customer = customers.find((c) => c.id === transaction.customerId);
      const transactionDate = transaction.transactionDate
        ? new Date(String(transaction.transactionDate))
        : null;
      const createdAt = transaction.createdAt
        ? new Date(String(transaction.createdAt))
        : null;

      return [
        transactionDate ? transactionDate.toLocaleDateString("id-ID") : "",
        customer?.name || transaction.customerId || "",
        transaction.description || "",
        transaction.type || "",
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(transaction.amount || 0),
        transaction.runningBalance
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(transaction.runningBalance)
          : "",
        createdAt
          ? createdAt.toLocaleDateString("id-ID") +
            " " +
            createdAt.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      ];
    });

    // Header untuk Excel
    const headers = [
      "Tanggal Transaksi",
      "Customer",
      "Deskripsi",
      "Tipe",
      "Jumlah",
      "Saldo",
      "Waktu Input",
    ];

    // Buat worksheet dengan header sebagai row pertama
    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);

    // Set lebar kolom
    const colWidths = [
      { wch: 15 }, // Tanggal Transaksi
      { wch: 20 }, // Customer
      { wch: 30 }, // Deskripsi
      { wch: 10 }, // Tipe
      { wch: 15 }, // Jumlah
      { wch: 15 }, // Saldo
      { wch: 20 }, // Waktu Input
    ];
    ws["!cols"] = colWidths;

    // Tambahkan range untuk Table dan AutoFilter
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    // Tambahkan Table untuk memungkinkan sorting dan filtering
    if (!ws["!tables"]) ws["!tables"] = [];
    ws["!tables"].push({
      name: "TransaksiTable",
      ref: XLSX.utils.encode_range(range),
      columns: headers.map((header, index) => ({
        name: header,
        key: index,
      })),
    });

    // Styling untuk header (row pertama)
    headers.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    });

    // Buat workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");

    // Generate filename dengan tanggal
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `transaksi_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
    toast("File Excel berhasil diunduh!");
  } catch (error) {
    console.error("Excel export error:", error);
    toast("Gagal mengexport file Excel");
  }
};
