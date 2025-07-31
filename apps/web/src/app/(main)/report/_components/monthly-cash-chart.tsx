"use client";

import { LineChart as LineChartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MonthlyOmsetData } from "@/hooks/use-report";

interface MonthlyCashChartProps {
  monthlyOmset: MonthlyOmsetData[];
  selectedYear: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function MonthlyCashChart({
  monthlyOmset,
  selectedYear,
}: MonthlyCashChartProps) {
  // Transform data untuk chart
  const chartData = monthlyOmset.map((item) => ({
    month: monthNames[item.month - 1],
    saldo: item.omset,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{`Bulan: ${label}`}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LineChartIcon className="h-6 w-6 text-purple-600" /> SALDO KAS PER
          BULAN {selectedYear}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Tren Saldo Kas Bulanan
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="month" className="text-sm text-gray-600" />
            <YAxis
              tickFormatter={(value: number) =>
                `${(value / 1000000).toFixed(0)}M`
              }
              className="text-sm text-gray-600"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
