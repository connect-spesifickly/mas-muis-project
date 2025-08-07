"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddPatientDialog } from "./_components/AddPatientDialog";
import { ServiceQueueTable } from "./_components/ServiceQueueTable";
import { getServices } from "./actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PatientQueuePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const result = await getServices();
    if (result.success && result.data) {
      setServices(result.data);
    } else {
      toast.error(result.message || "Gagal memuat antrian pasien.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-6">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl">Antrian Pasien</CardTitle>
            <CardDescription>
              Daftar perangkat yang sedang diservis.
            </CardDescription>
          </div>
          <AddPatientDialog onServiceAdded={fetchServices} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">Memuat antrian...</span>
            </div>
          ) : (
            <ServiceQueueTable
              services={services}
              onStatusUpdated={fetchServices}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
