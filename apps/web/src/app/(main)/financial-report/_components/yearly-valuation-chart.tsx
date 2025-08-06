"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { YearlyGraphData } from "@/hooks/use-report";

interface YearlyValuationChartProps {
  yearlyGraphData: YearlyGraphData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { year: number; totalValuasi: number };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`Tahun: ${label}`}</p>
        <p className="text-green-600">
          {`Valuasi: ${formatCurrency(payload[0].value)}`}
        </p>
      </div>
    );
  }
  return null;
};

export function YearlyValuationChart({
  yearlyGraphData,
}: YearlyValuationChartProps) {
  // Transform data untuk chart
  const chartData = yearlyGraphData.map((data) => ({
    year: data.year.toString(),
    totalValuasi: data.totalValuasi,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(0)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalValuasi" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
