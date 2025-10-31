"use client";
import { useMemo, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { name: "Jane Doe", email: "jane@example.com", role: "Nurse", status: "Verified" },
    { name: "John Smith", email: "john@example.com", role: "Doctor", status: "Pending" },
    { name: "Alice Brown", email: "alice@example.com", role: "Admin", status: "Verified" },
  ]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const filtered = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter(u => u.role.toLowerCase() === roleFilter);
  }, [roleFilter, users]);

  const approve = (email: string) => setUsers(prev => prev.map(u => u.email === email ? { ...u, status: "Verified" } : u));
  const remove = (email: string) => setUsers(prev => prev.filter(u => u.email !== email));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">User Management</h1>
      <DashboardCard title="Users">
        <div className="mb-4 flex items-center gap-3">
          <div className="text-sm text-zinc-700">Filter by role</div>
          <Select onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by role"><SelectValue placeholder="All roles" /></SelectTrigger>
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
              {filtered.map(u => (
                <TableRow key={u.email}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {u.status !== "Verified" && (
                      <Button size="sm" onClick={() => approve(u.email)} className="bg-blue-600 hover:bg-blue-700 text-white">Approve</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => remove(u.email)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </div>
  );
}
