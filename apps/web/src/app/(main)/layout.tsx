"use client";
import { PageType } from "@/interfaces/page-type";
import { redirect, usePathname } from "next/navigation";
import SidebarPage from "./_components/sidebar";
import BottomNavigation from "./_components/bottom-navigation";
import { Navbar } from "@/components/ui/navbar/main-navbar";
import { useSession } from "next-auth/react";
import React from "react";

// Definisi akses role
const rolePermissions: Record<string, PageType[]> = {
  OWNER: [
    "customer",
    "patient-queue",
    "transaction",
    "financial-report",
    "asset-stock",
    "user",
  ],
  ACCOUNTANT: ["transaction", "asset-stock"],
  TECHNICIAN: ["patient-queue", "customer"],
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Redirect ke login jika tidak terautentikasi
  React.useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  const getActivePage = React.useCallback((): PageType => {
    if (pathname.startsWith("/customer")) return "customer";
    if (pathname.startsWith("/patient-queue")) return "patient-queue";
    if (pathname.startsWith("/transaction")) return "transaction";
    if (pathname.startsWith("/financial-report")) return "financial-report";
    if (pathname.startsWith("/asset-stock")) return "asset-stock";
    if (pathname.startsWith("/user")) return "user";
    return "customer"; // default ke customer sebagai fallback
  }, [pathname]);

  // Fungsi untuk cek apakah user memiliki akses ke halaman tertentu
  const hasAccess = React.useCallback(
    (page: PageType): boolean => {
      if (!session?.role) return false;
      const userRole = session.role;
      return rolePermissions[userRole]?.includes(page) || false;
    },
    [session]
  );

  // Redirect jika user tidak memiliki akses ke halaman saat ini
  React.useEffect(() => {
    if (status === "authenticated" && session?.role) {
      const currentPage = getActivePage();

      if (!hasAccess(currentPage)) {
        // Redirect ke halaman pertama yang bisa diakses user
        const userRole = session.role;
        const allowedPages = rolePermissions[userRole];

        if (allowedPages && allowedPages.length > 0) {
          // Redirect ke halaman pertama yang diizinkan
          const firstAllowedPage = allowedPages[0];
          redirect(
            `/${firstAllowedPage === "patient-queue" ? "patient-queue" : firstAllowedPage}`
          );
        } else {
          // Jika tidak ada halaman yang diizinkan, redirect ke login
          redirect("/login");
        }
      }
    }
  }, [status, session, pathname, getActivePage, hasAccess]);

  // Filter bottom navigation items berdasarkan role
  const getFilteredBottomNavItems = () => {
    const allBottomNavItems = [
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
        page: "patient-queue" as PageType,
      },
      {
        id: 2,
        label: "Customer",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 20v-1a6 6 0 0112 0v1H6z"
            />
          </svg>
        ),
        href: "/customer",
        page: "customer" as PageType,
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
        page: "transaction" as PageType,
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
        page: "asset-stock" as PageType,
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
        page: "financial-report" as PageType,
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
              d="M17 20h5v-1a6 6 0 00-9-5.197M9 20H4v-1a6 6 0 019-5.197M12 12a4 4 0 100-8 4 4 0 000 8zM21 8a3 3 0 11-6 0 3 3 0 016 0zM9 8a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        href: "/user",
        page: "user" as PageType,
      },
    ];

    // Filter berdasarkan role user
    return allBottomNavItems.filter((item) => hasAccess(item.page));
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Jika tidak ada session, jangan render apa-apa (akan di-redirect ke login)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <div className="flex-col">
      <Navbar className="border-b-[1px] border-slate-200" />
      <div className="flex h-full min-h-[90vh] min-w-[calc(100vw)]">
        <aside className="">
          <SidebarPage
            activePage={getActivePage()}
            userRole={session.role ?? ""}
          />
        </aside>
        <BottomNavigation items={getFilteredBottomNavItems()} />
        <main className="w-full h-full min-h-[90vh]">
          <div className="flex sm:px-7 px-5 pt-[0px] lg:border-l-2 min-h-[91vh] pb-12 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
