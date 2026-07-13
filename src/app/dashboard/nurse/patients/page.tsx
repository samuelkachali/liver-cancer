"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

interface PatientRow {
  id: string;
  hospital_number: string;
  name: string;
  age: number;
  gender: string;
  symptoms: string | null;
  assigned_doctor_id: string | null;
}

interface DoctorRow {
  id: string;
  full_name: string;
  specialization: string | null;
}

export default function NursePatientsListPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, doctorsData] = await Promise.all([
          api.patients.list(),
          api.admin.doctors(),
        ]);
        setPatients(patientsData as PatientRow[]);
        setDoctors(doctorsData as DoctorRow[]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setPatients([]);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const assignDoctor = async (patientId: string, doctorId: string) => {
    setAssigning(patientId);
    setError("");
    try {
      await api.patients.assignDoctor(patientId, doctorId);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, assigned_doctor_id: doctorId } : p))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to assign doctor");
    } finally {
      setAssigning(null);
    }
  };

  const unassignDoctor = async (patientId: string) => {
    setAssigning(patientId);
    setError("");
    try {
      await api.patients.unassignDoctor(patientId);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, assigned_doctor_id: null } : p))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to unassign doctor");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Patients List</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
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
                <TableHead>Assigned Doctor</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-zinc-500">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-zinc-500">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.hospital_number}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell className="capitalize">{p.gender}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={p.symptoms || ""}>
                      {p.symptoms || "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.assigned_doctor_id ?? "__none__"}
                        onValueChange={(value) =>
                          value === "__none__" || value === "__remove__"
                            ? unassignDoctor(p.id)
                            : assignDoctor(p.id, value)
                        }
                        disabled={assigning === p.id}
                      >
                        <SelectTrigger className="w-48 h-8" aria-label={`Assign or change doctor for ${p.name}`}>
                          <SelectValue placeholder={assigning === p.id ? "Saving..." : "Assign doctor"} />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.full_name}
                              {d.specialization ? ` (${d.specialization})` : ""}
                            </SelectItem>
                          ))}
                          {p.assigned_doctor_id && (
                            <SelectItem value="__remove__" className="text-red-600 focus:text-red-600">
                              Remove assignment
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        View
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
