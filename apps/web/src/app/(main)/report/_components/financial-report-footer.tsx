"use client";

export function FinancialReportFooter() {
  return (
    <div className="mt-10 text-center">
      <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg inline-block shadow-sm">
        <span className="text-sm text-gray-600">
          Data diperbarui:{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
