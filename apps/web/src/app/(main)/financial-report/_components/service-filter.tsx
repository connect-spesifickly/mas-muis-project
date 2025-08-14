"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { serviceApi, type CompletedServiceOption } from "@/lib/api/service";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ServiceFilterProps {
  onSelect: (service: CompletedServiceOption | null) => void;
  selected?: CompletedServiceOption | null;
}

export function ServiceFilter({ onSelect, selected }: ServiceFilterProps) {
  const { data: session } = useSession();
  const token = (session as unknown as { accessToken?: string } | null)
    ?.accessToken as string | undefined;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<CompletedServiceOption[]>([]);

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
      console.error("ServiceFilter: failed to fetch options", err);
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

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="text-sm font-medium">Service Selesai:</div>
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? "Memuat..." : "Cari nama customer..."}
          className="h-9 w-[220px]"
        />
        <Badge variant="outline" className="text-xs">
          {options.length} ditemukan
        </Badge>
      </div>
      <div className="w-full max-w-xl">
        <div className="max-h-56 overflow-auto border rounded-md divide-y bg-white">
          {options.map((opt) => {
            const isSelected = selected && selected.id === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(isSelected ? null : opt)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {opt.customerName}
                      <span className="text-xs text-gray-500">
                        {" "}
                        (#{opt.id})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(opt.createdAt).toLocaleDateString("id-ID")} •{" "}
                      {opt.deviceSummary}
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Dipilih
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
          {options.length === 0 && !loading && (
            <div className="p-3 text-sm text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    </div>
  );
}
