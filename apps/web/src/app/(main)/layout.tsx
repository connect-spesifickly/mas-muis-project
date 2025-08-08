"use client";

import { PageType } from "@/interfaces/page-type";
import { redirect, usePathname } from "next/navigation";
import SidebarPage from "./_components/sidebar";
import BottomNavigation from "./_components/bottom-navigation";
import { Navbar } from "@/components/ui/navbar/main-navbar";
import { useSession } from "next-auth/react";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  React.useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
    // Tidak perlu redirect ke /sale jika sudah login
  }, [status]);
  const pathname = usePathname();

  const getActivePage = (): PageType => {
    if (pathname.startsWith("/sale")) return "sale";
    if (pathname.startsWith("/product")) return "product";
    if (pathname.startsWith("/customer")) return "customer";
    if (pathname.startsWith("/patient-queue")) return "patient-queue";
    if (pathname.startsWith("/transaction")) return "transaction";
    if (pathname.startsWith("/financial-report")) return "financial-report";
    if (pathname.startsWith("/asset-stock")) return "asset-stock";
    if (pathname.startsWith("/adjustment")) return "adjustment";
    if (pathname.startsWith("/user")) return "user";
    return "sale";
  };

  const bottomNavItems = [
    {
      id: 1,
      label: "Antrian Pasien",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      href: "/patient-queue",
    },
    {
      id: 2,
      label: "Customer",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      href: "/customer",
    },
    {
      id: 3,
      label: "Transaction",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      href: "/transaction",
    },
    {
      id: 4,
      label: "Asset & Stock",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      href: "/asset-stock",
    },
    {
      id: 6,
      label: "Financial Report",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      href: "/financial-report",
    },

    {
      id: 7,
      label: "Users",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      href: "/user",
    },
  ];
  return (
    <div className="flex-col  ">
      <Navbar className="border-b-[1px] border-slate-200 " />
      <div className="flex h-full min-h-[90vh] min-w-[calc(100vw)] ">
        <aside className="">
          <SidebarPage activePage={getActivePage()} />
        </aside>
        <BottomNavigation items={bottomNavItems} />
        <main className="w-full h-full min-h-[90vh]">
          <div className="flex sm:px-7 px-5 pt-[0px] lg:border-l-2 min-h-[91vh] pb-12 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
