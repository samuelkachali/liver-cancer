"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function NurseAssignDoctorPageContent() {
  const [assignedMsg, setAssignedMsg] = useState<string>("");
  const searchParams = useSearchParams();
  const patientName = useMemo(() => {
    const q = searchParams?.get("patient");
    const fromQuery = q ? decodeURIComponent(q) : "";
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined") {
      const ls = window.localStorage.getItem("selectedPatientName") || "";
      return ls || "patient";
    }
    return "patient";
  }, [searchParams]);
  useEffect(() => {
    if (typeof window !== "undefined" && patientName && patientName !== "patient") {
      window.localStorage.setItem("selectedPatientName", patientName);
    }
  }, [patientName]);
  const doctors = [
    { name: "Dr. Smith", specialization: "Oncology", status: "Available" },
    { name: "Dr. Adams", specialization: "Hepatology", status: "Busy" },
    { name: "Dr. Lee", specialization: "Gastroenterology", status: "Available" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Assign Doctor</h1>
      <DashboardCard title="Available Doctors">
        {assignedMsg && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{assignedMsg}</div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.name}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" aria-label={`Assign ${patientName} to ${d.name}`}>Assign Doctor</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAssignedMsg(`${patientName} assigned to ${d.name}`)}>Assign {patientName}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default function NurseAssignDoctorPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-zinc-600">Loading...</div>}>
      <NurseAssignDoctorPageContent />
    </Suspense>
  );
}
