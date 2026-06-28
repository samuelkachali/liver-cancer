"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

interface DiagnosisRow {
  id: string;
  patient_id: string;
  cancer_type: string;
  confidence: number;
  status: string;
  created_at: string;
  patient_name?: string;
}

export default function DoctorPastDiagnosesPage() {
  const [past, setPast] = useState<DiagnosisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const data = await api.diagnoses.list();
        const mapped = (data as any[]).map((d) => ({
          id: d.id,
          patient_id: d.patient_id,
          cancer_type: d.cancer_type,
          confidence: Number(d.confidence),
          status: d.status,
          created_at: d.created_at,
        }));
        setPast(mapped);
      } catch (error) {
        console.error("Failed to fetch diagnoses:", error);
        setPast([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Past Diagnoses</h1>
      <DashboardCard title="History">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    Loading diagnoses...
                  </TableCell>
                </TableRow>
              ) : past.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    No diagnoses found
                  </TableCell>
                </TableRow>
              ) : (
                past.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{r.patient_id}</TableCell>
                    <TableCell className="capitalize">{r.cancer_type}</TableCell>
                    <TableCell>{r.confidence.toFixed(1)}%</TableCell>
                    <TableCell className="capitalize">{r.status}</TableCell>
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
