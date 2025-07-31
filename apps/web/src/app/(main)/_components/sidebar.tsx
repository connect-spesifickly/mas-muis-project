import { PageType } from "@/interfaces/page-type";
import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { mutate } from "swr";

interface SidebarProps {
  activePage: PageType;
}
export function SidebarPage({ activePage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const isMdOrLarger = window.innerWidth >= 768;
      if (!isMdOrLarger) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const sidebarItems: { id: PageType; label: string; icon: string }[] = [
    { id: "sale", label: "Sale", icon: "shopping-cart" },
    { id: "product", label: "Product", icon: "box" },
    { id: "customer", label: "Customer", icon: "users" },
    { id: "transaction", label: "Transaction", icon: "credit-card" },
    { id: "financial-report", label: "Financial Report", icon: "trending-up" },
    { id: "asset-stock", label: "Asset & Stock", icon: "package" },
    { id: "adjustment", label: "Adjustment", icon: "adjustment" },
  ];
  const getIcon = (icon: string) => {
    switch (icon) {
      case "shopping-cart":
        return (
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7"
            />
          </svg>
        );
      case "box":
        return (
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
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case "adjustment":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19.4 15A7.97 7.97 0 0021 12c0-4.42-3.58-8-8-8S5 7.58 5 12c0 1.07.21 2.09.6 3"
            />
          </svg>
        );
      case "users":
        return (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        );
      case "credit-card":
        return (
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case "trending-up":
        return (
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case "package":
        return (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      default:
        return null;
    }
  };
  if (isCollapsed) {
    return null;
  }
  return (
    <div className="sticky left-0 top-16 z-40">
      <div className="relative z-30 hidden h-full ml-1 mr-1 bg-transparent w-60 lg:block">
        {/* SIdebar content */}
        <div className="px-4 py-4">
          <nav>
            <ul className="space-y-2 text-[14px]">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.id}`}
                    prefetch={true}
                    onMouseEnter={() => {
                      // Prefetch SWR data sesuai halaman
                      if (item.id === "product") {
                        mutate(["products"]);
                        mutate(["categories"]);
                      } else if (item.id === "sale") {
                        mutate(["products"]);
                        mutate(["categories"]);
                      } else if (item.id === "financial-report") {
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();
                        mutate(["financial-report", currentMonth, currentYear]);
                      } else if (item.id === "asset-stock") {
                        mutate(["assets"]);
                        mutate(["stocks"]);
                      } else if (item.id === "adjustment") {
                        mutate(["stock-adjustments"]);
                      } else if (item.id === "customer") {
                        mutate(["customers"]);
                      } else if (item.id === "transaction") {
                        mutate(["transactions"]);
                      }
                    }}
                    className={`flex w-full items-center rounded-md px-4 py-3 ${
                      activePage === item.id
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "text-gray-600 hover:text-white hover:bg-blue-500"
                    }`}
                  >
                    <span className="mr-3">{getIcon(item.icon)}</span>
                    <span className="text-[15px]">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default SidebarPage;
