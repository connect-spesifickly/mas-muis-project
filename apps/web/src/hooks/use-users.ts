"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/lib/api/user";
import { User, CreateUserData, UserFilters } from "@/types/user";
import { toast } from "sonner";

export function useUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });

  const fetchUsers = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await userApi.list(filters, session.accessToken);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await userApi.listDeleted(filters, session.accessToken);
      setDeletedUsers(response.data);
    } catch (error) {
      console.error("Error fetching deleted users:", error);
      toast.error("Failed to fetch deleted users");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserData) => {
    if (!session?.accessToken) return;

    try {
      const newUser = await userApi.create(data, session.accessToken);
      setUsers((prev) => [...prev, newUser]);
      toast.success("User created successfully");
      return newUser;
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
      throw error;
    }
  };

  const removeUser = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      await userApi.remove(id, session.accessToken);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error: any) {
      console.error("Error removing user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
      throw error;
    }
  };

  const restoreUser = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      await userApi.restore(id, session.accessToken);
      setDeletedUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User restored successfully");
    } catch (error: any) {
      console.error("Error restoring user:", error);
      toast.error(error.response?.data?.message || "Failed to restore user");
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, session?.accessToken]);

  return {
    users,
    deletedUsers,
    loading,
    filters,
    setFilters,
    fetchUsers,
    fetchDeletedUsers,
    createUser,
    removeUser,
    restoreUser,
  };
}
