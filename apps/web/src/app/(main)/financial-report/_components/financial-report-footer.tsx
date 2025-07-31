"use client";

export function FinancialReportFooter() {
  return (
    <div className="text-center py-6 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        © 2025 Mas Muiz ERP. Laporan Keuangan dibuat secara otomatis.
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Terakhir diperbarui: {new Date().toLocaleString("id-ID")}
      </p>
    </div>
  );
}
