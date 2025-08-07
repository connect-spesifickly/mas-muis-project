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
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PatientQueuePage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    if (!session?.accessToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        setServices([]);
        toast.error(data.message || "Gagal memuat antrian pasien.");
      }
    } catch (error) {
      toast.error("Gagal memuat antrian pasien.");
    }
    setLoading(false);
  }, [session]);

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
