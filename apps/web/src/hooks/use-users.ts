"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/lib/api/user";
import { User, CreateUserData, UserFilters } from "@/types/user";
import { toast } from "sonner";

export function useUsers() {
  const { data: session } = useSession();
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store semua data users
  const [allDeletedUsers, setAllDeletedUsers] = useState<User[]>([]); // Store semua deleted users
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    search: "", // Add search filter
  });

  // Filter users di client-side berdasarkan search term
  const users = useMemo(() => {
    if (!filters.search) return allUsers;

    const searchTerm = filters.search.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }, [allUsers, filters.search]);

  // Filter deleted users di client-side berdasarkan search term
  const deletedUsers = useMemo(() => {
    if (!filters.search) return allDeletedUsers;

    const searchTerm = filters.search.toLowerCase();
    return allDeletedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }, [allDeletedUsers, filters.search]);

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      // Fetch semua users tanpa search filter (biar dapat semua data)
      const filtersWithoutSearch = { ...filters };
      delete filtersWithoutSearch.search;

      console.log("Fetching all users");
      const response = await userApi.list(
        filtersWithoutSearch,
        session.accessToken
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters, session?.accessToken]);

  const fetchDeletedUsers = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      // Fetch semua deleted users tanpa search filter
      const filtersWithoutSearch = { ...filters };
      delete filtersWithoutSearch.search;

      const response = await userApi.listDeleted(
        filtersWithoutSearch,
        session.accessToken
      );
      setAllDeletedUsers(response.data);
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
      setAllUsers((prev) => [...prev, newUser]);
      toast.success("User created successfully");
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        "Failed to create user, mungkin user dengan email tersebut sudah ada"
      );
      throw error;
    }
  };

  const removeUser = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      await userApi.remove(id, session.accessToken);
      setAllUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("Failed to delete user");
      throw error;
    }
  };

  const restoreUser = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      await userApi.restore(id, session.accessToken);
      setAllDeletedUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User restored successfully");
    } catch (error) {
      console.error("Error restoring user:", error);
      toast.error("Failed to restore user");
      throw error;
    }
  };

  const hardDeleteUser = async (id: string) => {
    if (!session?.accessToken) return;

    try {
      await userApi.hardDelete(id, session.accessToken);
      setAllDeletedUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User permanently deleted");
    } catch (error) {
      console.error("Error hard-deleting user:", error);
      toast.error("Failed to permanently delete user");
      throw error;
    }
  };

  // Hanya fetch saat session berubah atau saat pertama kali load
  // Tidak fetch ulang saat search berubah
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users, // Ini sudah hasil filtered
    deletedUsers, // Ini juga sudah hasil filtered
    loading,
    filters,
    setFilters,
    fetchUsers,
    fetchDeletedUsers,
    createUser,
    removeUser,
    restoreUser,
    hardDeleteUser,
  };
}
