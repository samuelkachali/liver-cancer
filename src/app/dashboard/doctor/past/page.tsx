"use client";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DoctorPastDiagnosesPage() {
  const past = [
    { date: "2025-10-01", patient: "Jane Doe", type: "Colon", conf: "88%", status: "Reviewed" },
    { date: "2025-09-21", patient: "John Smith", type: "Liver", conf: "91%", status: "Reviewed" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Past Diagnoses</h1>
      <DashboardCard title="History">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.map((r) => (
                <TableRow key={r.date + r.patient}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.patient}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.conf}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </div>
  );
}
