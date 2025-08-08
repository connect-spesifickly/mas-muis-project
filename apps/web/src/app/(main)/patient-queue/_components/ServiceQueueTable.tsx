"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ServiceStatus } from "@/types/service";
import { updateDeviceStatus } from "../actions";
import { toast } from "sonner";

interface Device {
  id: number;
  deviceType: string;
  problemDescription: string;
  accessoriesLeft?: string | null;
  status: ServiceStatus;
}

interface Service {
  id: number;
  createdAt: string | Date;
  customer: { id: string; name: string; phone: string };
  devices: Device[];
}

interface ServiceQueueTableProps {
  services: Service[];
  onStatusUpdated: () => void;
}

const statusLabels: Record<ServiceStatus, string> = {
  PENDING: "Tertunda",
  CONFIRMATIONPENDING: "Menunggu Konfirmasi",
  IN_PROGRESS: "Dalam Proses",
  COMPLETED: "Selesai",
  RETURNED_TO_CUSTOMER: "Dikembalikan ke Pelanggan",
  CANCELLED: "Dibatalkan",
};

const getStatusBadgeVariant = (status: ServiceStatus) => {
  switch (status) {
    case ServiceStatus.PENDING:
      return "secondary";
    case ServiceStatus.CONFIRMATIONPENDING:
      return "outline";
    case ServiceStatus.IN_PROGRESS:
      return "default";
    case ServiceStatus.COMPLETED:
    case ServiceStatus.RETURNED_TO_CUSTOMER:
      return "success";
    case ServiceStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
};

export function ServiceQueueTable({
  services,
  onStatusUpdated,
}: ServiceQueueTableProps) {
  const [updatingDeviceId, setUpdatingDeviceId] = useState<number | null>(null);
  const { data: session } = useSession();

  const handleStatusUpdate = async (
    deviceId: number,
    newStatus: ServiceStatus
  ) => {
    if (!session?.accessToken) {
      toast.error("Authentication required");
      return;
    }

    setUpdatingDeviceId(deviceId);
    const result = await updateDeviceStatus(
      deviceId,
      newStatus,
      session.accessToken
    );
    if (result.success) {
      toast.success(
        `Status perangkat berhasil diperbarui ke ${statusLabels[newStatus]}.`
      );
      onStatusUpdated();
    } else {
      toast.error(result.message || "Gagal memperbarui status perangkat.");
    }
    setUpdatingDeviceId(null);
  };

  return (
    <div className="border shadow-sm rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead className="w-[150px]">Nama Customer</TableHead>
            <TableHead className="w-[120px]">No. HP</TableHead>
            <TableHead>Pasien (Perangkat & Status)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada antrian pasien saat ini.
              </TableCell>
            </TableRow>
          ) : (
            (services || []).map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  {format(new Date(service.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{service.customer.name}</TableCell>
                <TableCell>{service.customer.phone}</TableCell>
                <TableCell>
                  <div className="grid gap-2">
                    {service.devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 border rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{device.deviceType}</p>
                          <p className="text-sm text-muted-foreground">
                            Keluhan: {device.problemDescription}
                          </p>
                          {device.accessoriesLeft && (
                            <p className="text-xs text-muted-foreground">
                              Ditinggal: {device.accessoriesLeft}
                            </p>
                          )}
                          <Badge
                            variant={getStatusBadgeVariant(device.status)}
                            className="mt-1"
                          >
                            {statusLabels[device.status]}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-0 sm:ml-4 mt-2 sm:mt-0"
                              disabled={updatingDeviceId === device.id}
                            >
                              {updatingDeviceId === device.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Update Status"
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {Object.values(ServiceStatus).map(
                              (statusOption) => (
                                <DropdownMenuItem
                                  key={statusOption}
                                  onSelect={() =>
                                    handleStatusUpdate(device.id, statusOption)
                                  }
                                  disabled={device.status === statusOption}
                                >
                                  {statusLabels[statusOption]}
                                  {device.status === statusOption && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
