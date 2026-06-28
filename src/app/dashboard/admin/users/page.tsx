"use client";
import { useMemo, useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.admin.users();
        const mapped = (data as any[]).map((u) => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role,
          status: u.status,
        }));
        setUsers(mapped);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const base = roleFilter === "all" ? users : users.filter((u) => u.role.toLowerCase() === roleFilter);
    return base;
  }, [roleFilter, users]);

  const approve = async (id: string) => {
    try {
      await api.admin.verifyUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "verified" } : u)));
    } catch (error) {
      console.error("Failed to verify user:", error);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">User Management</h1>
      <DashboardCard title="Users">
        <div className="mb-4 flex items-center gap-3">
          <div className="text-sm text-zinc-700">Filter by role</div>
          <Select onValueChange={setRoleFilter} defaultValue="all">
            <SelectTrigger className="w-40" aria-label="Filter by role">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell className="capitalize">{u.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {u.status !== "verified" && (
                        <Button size="sm" onClick={() => approve(u.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => remove(u.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </div>
  );
}
