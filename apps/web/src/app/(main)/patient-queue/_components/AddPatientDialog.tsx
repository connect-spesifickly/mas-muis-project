"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createService } from "../actions";
import { toast } from "sonner";
import { Router } from "express";

const deviceSchema = yup.object().shape({
  deviceType: yup.string().required("Jenis perangkat harus diisi."),
  problemDescription: yup.string().required("Keluhan harus diisi."),
  accessoriesLeft: yup.string().optional(),
});

const formSchema = yup.object().shape({
  date: yup.date().required(),
  customerId: yup.string().required("Pilih pelanggan."),
  devices: yup
    .array()
    .of(deviceSchema)
    .min(1, "Setidaknya satu perangkat harus ditambahkan.")
    .required(),
});

type FormData = yup.InferType<typeof formSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export function AddPatientDialog({
  onServiceAdded,
}: {
  onServiceAdded: () => void;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const form = useForm<FormData>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      date: new Date(),
      customerId: "",
      devices: [
        { deviceType: "", problemDescription: "", accessoriesLeft: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "devices",
  });

  useEffect(() => {
    async function fetchCustomers() {
      if (!session?.accessToken) {
        console.log("No session access token available");
        return;
      }

      try {
        setLoadingCustomers(true);
        console.log(
          "Fetching customers with token:",
          session.accessToken.substring(0, 20) + "..."
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/customers`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log("Customer API response status:", res.status);
        const data = await res.json();
        console.log("Customer API response data:", data);
        console.log("Data Customers:", data.data.data);
        setCustomers(data.data.data);
      } catch (error) {
        console.error("Customer fetch error:", error);
        setCustomers([]);
        toast.error("Gagal memuat daftar pelanggan.");
      } finally {
        setLoadingCustomers(false);
      }
    }

    if (open) {
      fetchCustomers();
    }
  }, [session, open]);

  const selectedCustomer = form.watch("customerId");

  const onSubmit = async (data: FormData) => {
    if (!session?.accessToken) {
      toast.error("Authentication required");
      return;
    }

    const result = await createService(
      {
        customerId: data.customerId,
        devices: data.devices,
      },
      session.accessToken
    );

    if (result.success) {
      toast.success("Antrian pasien berhasil ditambahkan.");
      form.reset({
        date: new Date(),
        customerId: "",
        devices: [
          { deviceType: "", problemDescription: "", accessoriesLeft: "" },
        ],
      });
      setOpen(false);
      onServiceAdded();
    } else {
      toast.error(result.message || "Gagal menambahkan antrian pasien.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pasien
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Antrian Pasien Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pelanggan dan perangkat yang akan diservis.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Tanggal
            </Label>
            <Input
              type="date"
              id="date"
              {...form.register("date")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerId" className="text-right">
              Nama Customer
            </Label>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    if (val === "add-new") {
                      window.location.href = "/customer";
                    } else {
                      field.onChange(val);
                    }
                  }}
                  value={field.value}
                  disabled={loadingCustomers}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="animate-spin mr-2 h-4 w-4 inline-block" />{" "}
                        Memuat...
                      </SelectItem>
                    ) : customers.length === 0 ? (
                      <SelectItem value="no-customers" disabled>
                        Tidak ada customer tersedia
                      </SelectItem>
                    ) : (
                      <>
                        {(customers || []).map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="add-new"
                          className="text-blue-600 font-semibold"
                        >
                          + Tambah customer baru...
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerPhone" className="text-right">
              No. HP
            </Label>
            <Input
              id="customerPhone"
              value={
                selectedCustomer
                  ? customers.find((c) => c.id === selectedCustomer)?.phone ||
                    ""
                  : ""
              }
              readOnly
              className="col-span-3"
            />
          </div>

          <div className="space-y-4 pt-4 border-t mt-4">
            <h3 className="text-lg font-semibold">
              Perangkat ({fields.length})
            </h3>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md relative"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-destructive"
                  disabled={fields.length === 1}
                >
                  X
                </Button>
                <div>
                  <Label htmlFor={`devices.${index}.deviceType`}>
                    Jenis Perangkat
                  </Label>
                  <Input
                    id={`devices.${index}.deviceType`}
                    {...form.register(`devices.${index}.deviceType`)}
                    placeholder="Contoh: Laptop, HP, Tablet"
                    className="mt-1"
                  />
                  {form.formState.errors.devices?.[index]?.deviceType && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        form.formState.errors.devices[index]?.deviceType
                          ?.message
                      }
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`devices.${index}.problemDescription`}>
                    Keluhan
                  </Label>
                  <Textarea
                    id={`devices.${index}.problemDescription`}
                    {...form.register(`devices.${index}.problemDescription`)}
                    placeholder="Jelaskan keluhan perangkat"
                    className="mt-1"
                  />
                  {form.formState.errors.devices?.[index]
                    ?.problemDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {
                        form.formState.errors.devices[index]?.problemDescription
                          ?.message
                      }
                    </p>
                  )}
                </div>
                <div className="col-span-full">
                  <Label htmlFor={`devices.${index}.accessoriesLeft`}>
                    Yang Ditinggalkan (Aksesoris)
                  </Label>
                  <Input
                    id={`devices.${index}.accessoriesLeft`}
                    {...form.register(`devices.${index}.accessoriesLeft`)}
                    placeholder="Contoh: Charger ori, Tas"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  deviceType: "",
                  problemDescription: "",
                  accessoriesLeft: "",
                })
              }
              className="w-full"
            >
              Tambah Perangkat Lain
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Antrian
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
