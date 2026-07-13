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
  contact: string | null;
  address: string | null;
  file_url: string | null;
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
  const [viewing, setViewing] = useState<PatientRow | null>(null);

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
                      <Button size="sm" variant="outline" onClick={() => setViewing(p)}>
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

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${viewing.name}`}
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{viewing.name}</h2>
                <p className="text-sm text-zinc-600">{viewing.hospital_number}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100"
                onClick={() => setViewing(null)}
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              {viewing.file_url && (
                <img
                  src={viewing.file_url}
                  alt={`${viewing.name} image`}
                  className="h-48 w-full rounded-lg border border-zinc-200 object-cover"
                />
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Age</dt>
                  <dd className="font-medium text-zinc-900">{viewing.age}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Gender</dt>
                  <dd className="font-medium capitalize text-zinc-900">{viewing.gender}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Contact</dt>
                  <dd className="font-medium text-zinc-900">{viewing.contact || "—"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Address</dt>
                  <dd className="font-medium text-zinc-900">{viewing.address || "—"}</dd>
                </div>
              </dl>
              <div>
                <dt className="text-sm text-zinc-500">Symptoms</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{viewing.symptoms || "—"}</dd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
