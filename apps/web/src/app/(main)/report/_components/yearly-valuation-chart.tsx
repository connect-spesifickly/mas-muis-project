"use client";

import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { YearlyGraphData } from "@/hooks/use-report";

interface YearlyValuationChartProps {
  yearlyGraphData: YearlyGraphData[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function YearlyValuationChart({
  yearlyGraphData,
}: YearlyValuationChartProps) {
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
          <p className="text-sm text-gray-600">{`Tahun: ${label}`}</p>
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
          <BarChart3 className="h-6 w-6 text-orange-600" /> VALUASI PERUSAHAAN
          PER TAHUN
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Tren Valuasi Tahunan
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyGraphData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="year" className="text-sm text-gray-600" />
            <YAxis
              tickFormatter={(value: number) =>
                `${(value / 1000000).toFixed(0)}M`
              }
              className="text-sm text-gray-600"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalValuasi" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
