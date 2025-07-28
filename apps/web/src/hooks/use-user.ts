"use client";

import { useSession } from "next-auth/react";

interface User {
  id: string;
  role: "OWNER" | "ACCOUNTANT" | "TECHNICIAN";
  name: string;
  email: string;
}

export function useUser() {
  const { data: session, status } = useSession();

  const user: User | null = session
    ? {
        id: session.id || "",
        role: session.role as "OWNER" | "ACCOUNTANT" | "TECHNICIAN",
        name: session.email || "",
        email: session.email || "",
      }
    : null;

  return {
    user,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
