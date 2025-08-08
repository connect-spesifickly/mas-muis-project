"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddPatientDialog } from "./_components/AddPatientDialog";
import { ServiceQueueTable } from "./_components/ServiceQueueTable";
import { useSession } from "next-auth/react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function PatientQueuePage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      console.log(
        "Fetching services with token:",
        session.accessToken.substring(0, 20) + "..."
      );
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/services`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      console.log("Services API response status:", res.status);
      const data = await res.json();
      console.log("Services API response data:", data);

      if (res.ok && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        setServices([]);
        console.error("Services API error:", data);
        toast.error(data.message || "Gagal memuat antrian pasien.");
      }
    } catch (error) {
      console.error("Services fetch error:", error);
      setServices([]);
      toast.error("Gagal memuat antrian pasien.");
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading && services.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              Antrian Pasien
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {services.length} Services
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Patient Queue Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Antrian Pasien</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kelola daftar perangkat yang sedang diservis dan status layanan
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    Total Services: {services.length}
                  </span>
                </div>
                <AddPatientDialog onServiceAdded={fetchServices} />
              </div>

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
      </div>
    </div>
  );
}
