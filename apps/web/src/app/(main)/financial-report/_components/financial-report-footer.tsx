"use client";

import { Card, CardContent } from "@/components/ui/card";

export function FinancialReportFooter() {
  return (
    <Card>
      <CardContent className="text-center py-4">
        <p className="text-sm text-gray-500">
          © 2025 Mas Muiz ERP. Laporan Keuangan dibuat secara otomatis.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Terakhir diperbarui: {new Date().toLocaleString("id-ID")}
        </p>
      </CardContent>
    </Card>
  );
}
