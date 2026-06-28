"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ApprovalRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await api.admin.pendingUsers();
        const mapped = (data as any[]).map((u) => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role,
        }));
        setPending(mapped);
      } catch (error) {
        console.error("Failed to fetch pending users:", error);
        setPending([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const approve = async (id: string) => {
    try {
      await api.admin.verifyUser(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const reject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this user?")) return;
    try {
      await api.admin.rejectUser(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Approvals</h1>
      <DashboardCard title="Pending Requests">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-zinc-500">
                    Loading pending requests...
                  </TableCell>
                </TableRow>
              ) : pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-zinc-500">
                    No pending approvals
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell className="capitalize">{p.role}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => approve(p.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => reject(p.id)}>
                        Reject
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
