"use client";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function NursePatientsListPage() {
  const patients = [
    { id: "HN-2025-001", name: "Jane Doe", age: 45, gender: "Female", sym: "Abdominal pain" },
    { id: "HN-2025-002", name: "John Smith", age: 52, gender: "Male", sym: "Weight loss" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Patients List</h1>
      <DashboardCard title="All Patients">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell className="max-w-[260px] truncate" title={p.sym}>{p.sym}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">View</Button>
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
