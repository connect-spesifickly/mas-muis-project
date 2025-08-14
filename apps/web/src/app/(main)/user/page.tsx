"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useUsers } from "@/hooks/use-users";

import { User, CreateUserData } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Trash2, RotateCcw, Search } from "lucide-react";
import { format } from "date-fns";

function CreateUserModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    name: "",
    role: "TECHNICIAN",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ email: "", password: "", name: "", role: "TECHNICIAN" });
      onClose();
    } catch {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Only OWNER can create users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter user name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "ACCOUNTANT" | "TECHNICIAN") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECHNICIAN">Technician</SelectItem>
                  <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RestoreUserModal({
  isOpen,
  onClose,
  user,
  onRestore,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRestore: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await onRestore(user.id);
      onClose();
    } catch {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore User</DialogTitle>
          <DialogDescription>
            Are you sure you want to restore {user?.name}? This will make the
            user active again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleRestore} disabled={loading}>
            {loading ? (
              "Restoring..."
            ) : (
              <span className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Skeleton Components
function UserCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <div className="flex items-center space-x-2 mt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right space-y-1">
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="sticky top-16 z-40 bg-background border-b">
      <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
        <div className="flex items-center justify-between flex-1">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function UserListCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <UserTableSkeleton />
      </CardContent>
    </Card>
  );
}

function FullPageSkeleton() {
  return (
    <div className="w-full h-full relative">
      <HeaderSkeleton />
      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          <SearchCardSkeleton />
          <UserListCardSkeleton />
        </div>
      </div>
    </div>
  );
}

function UserTable({
  users,
  onDelete,
  onRestore,
  onHardDelete,
  showDeleted = false,
}: {
  users: User[];
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onHardDelete: (user: User) => void;
  showDeleted?: boolean;
}) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge variant="default">Owner</Badge>;
      case "ACCOUNTANT":
        return <Badge variant="secondary">Accountant</Badge>;
      case "TECHNICIAN":
        return <Badge variant="outline">Technician</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {showDeleted ? "No deleted users found" : "No users found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(user.role)}
                    {user.deletedAt && (
                      <Badge variant="destructive">Deleted</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </p>
                  {user.deletedAt && (
                    <p className="text-sm text-muted-foreground">
                      Deleted:{" "}
                      {format(new Date(user.deletedAt), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
                {showDeleted ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRestore(user)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onHardDelete(user)}
                    >
                      Hard Delete
                    </Button>
                  </div>
                ) : (
                  user.role !== "OWNER" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function UserManagement() {
  const { user: currentUser, loading: userLoading } = useUser();
  const {
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
    hardDeleteUser,
  } = useUsers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isHardDelete, setIsHardDelete] = useState(false);

  // Show full page skeleton when checking user authentication
  if (userLoading) {
    return <FullPageSkeleton />;
  }

  // Check if current user is OWNER
  if (currentUser?.role !== "OWNER") {
    return (
      <div className="w-full h-full relative">
        <div className="sticky top-16 z-40 bg-background border-b">
          <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
                User Management
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground">
                    Only OWNER can access user management.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (data: CreateUserData) => {
    await createUser(data);
  };

  const handleDeleteUser = async (user: User) => {
    setIsHardDelete(false);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleRestoreUser = async (user: User) => {
    setSelectedUser(user);
    setShowRestoreModal(true);
  };

  const handleConfirmDelete = async (id: string) => {
    if (isHardDelete) {
      await hardDeleteUser(id);
      setIsHardDelete(false);
    } else {
      await removeUser(id);
    }
  };

  const handleConfirmRestore = async (id: string) => {
    await restoreUser(id);
    // Always refresh active users list so it's up-to-date
    await fetchUsers();
    // If we are currently on the Deleted tab, also refresh the deleted list
    if (showDeleted) {
      await fetchDeletedUsers();
    }
    // Optionally force route refresh if needed
    // router.refresh();
  };

  const handleToggleDeleted = () => {
    const next = !showDeleted;
    setShowDeleted(next);
    if (next) {
      fetchDeletedUsers();
    } else {
      fetchUsers();
    }
  };

  // Show full page skeleton on initial load
  if (loading && users.length === 0 && !showDeleted) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="w-full h-full relative">
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 md:px-1 px-2">
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-2xl md:text-3xl font-bold md:px-5 font-[stencil]">
              User Management
            </h1>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <Badge variant="secondary" className="text-sm">
                  {showDeleted ? deletedUsers.length : users.length} Users
                </Badge>
              )}
              <Button
                variant={showDeleted ? "default" : "outline"}
                size="sm"
                onClick={handleToggleDeleted}
                disabled={loading && showDeleted && deletedUsers.length === 0}
              >
                {loading && showDeleted && deletedUsers.length === 0
                  ? "Loading..."
                  : showDeleted
                    ? "Show Active"
                    : "Show Deleted"}
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-6">
          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and filter users by name or email
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* User List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {showDeleted ? "Deleted Users" : "Active Users"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {showDeleted
                  ? "Manage deleted users and restore them if needed"
                  : "Manage system users and their roles"}
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <UserTableSkeleton
                  count={showDeleted && deletedUsers.length === 0 ? 3 : 5}
                />
              ) : (
                <UserTable
                  users={showDeleted ? deletedUsers : users}
                  onDelete={handleDeleteUser}
                  onRestore={handleRestoreUser}
                  onHardDelete={(user: User) => {
                    setIsHardDelete(true);
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                  showDeleted={showDeleted}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onDelete={handleConfirmDelete}
      />

      <RestoreUserModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onRestore={handleConfirmRestore}
      />
    </div>
  );
}
