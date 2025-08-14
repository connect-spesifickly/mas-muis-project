"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { serviceApi, type CompletedServiceOption } from "@/lib/api/service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ServiceSelectProps {
  onPick: (service: CompletedServiceOption) => void;
}

export default function ServiceSelect({ onPick }: ServiceSelectProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<CompletedServiceOption[]>([]);

  const token = (session as unknown as { accessToken?: string } | null)
    ?.accessToken as string | undefined;

  const fetchOptions = async (q?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await serviceApi.listCompletedWithoutTransaction(
        q,
        token,
        25
      );
      setOptions(data);
    } catch (err) {
      console.error("Failed fetching completed services:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => fetchOptions(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const placeholder = loading ? "Memuat..." : "Cari nama customer...";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-9"
        />
        <Badge variant="outline" className="whitespace-nowrap">
          {options.length} ditemukan
        </Badge>
      </div>
      <div className="max-h-64 overflow-auto border rounded-md divide-y">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50"
          >
            <div className="font-medium">
              {opt.customerName}{" "}
              <span className="text-xs text-gray-500">(#{opt.id})</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(opt.createdAt).toLocaleDateString("id-ID")} •{" "}
              {opt.deviceSummary}
            </div>
          </button>
        ))}
        {options.length === 0 && !loading && (
          <div className="p-3 text-sm text-gray-500">Tidak ada data</div>
        )}
      </div>
    </div>
  );
}
