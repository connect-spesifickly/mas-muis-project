import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();

  if (session) {
    const role = session.role;

    if (role === "OWNER" || role === "TECHNICIAN") {
      // Owner & Technician -> Antrian Pasien
      redirect("/patient-queue");
    } else if (role === "ACCOUNTANT") {
      // Accountant -> Transaksi Kas
      redirect("/transaction");
    } else {
      // Fallback
      redirect("/customer");
    }
  } else {
    redirect("/login");
  }
}
