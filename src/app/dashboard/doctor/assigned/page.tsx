"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface AssignedRow {
  id: string;
  hospital_number: string;
  name: string;
  age: number;
  gender: string;
}

export default function DoctorAssignedPatientsPage() {
  const [assigned, setAssigned] = useState<AssignedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const data = await api.patients.list();
        const mapped = (data as any[]).map((p) => ({
          id: p.id,
          hospital_number: p.hospital_number,
          name: p.name,
          age: p.age,
          gender: p.gender,
        }));
        setAssigned(mapped);
      } catch (error) {
        console.error("Failed to fetch assigned patients:", error);
        setAssigned([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Assigned Patients</h1>
      <DashboardCard title="Your Patients">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : assigned.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    No assigned patients
                  </TableCell>
                </TableRow>
              ) : (
                assigned.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.hospital_number}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.age}</TableCell>
                    <TableCell className="capitalize">{a.gender}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Open
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
