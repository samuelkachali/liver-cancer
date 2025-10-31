"use client";
import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AdminApprovalsPage() {
  const [pending, setPending] = useState([
    { name: "Sam Walker", email: "sam@example.com", role: "Nurse" },
    { name: "Priya Rao", email: "priya@example.com", role: "Doctor" },
  ]);
  const approve = (email: string) => setPending(prev => prev.filter(p => p.email !== email));
  const reject = (email: string) => setPending(prev => prev.filter(p => p.email !== email));
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
              {pending.map(p => (
                <TableRow key={p.email}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => approve(p.email)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(p.email)}>Reject</Button>
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
