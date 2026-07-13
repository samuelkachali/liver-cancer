"use client";
import { useEffect, useMemo, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface DoctorRow {
  id: string;
  full_name: string;
  email: string;
  specialization: string | null;
  assigned_patient_count: number;
}

interface PatientRow {
  id: string;
  hospital_number: string;
  name: string;
  age: number;
  gender: string;
  symptoms: string | null;
  assigned_doctor_id: string | null;
}

export default function NurseDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoctor, setViewingDoctor] = useState<DoctorRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, patientsData] = await Promise.all([
          api.admin.doctors(),
          api.patients.list(),
        ]);
        setDoctors(doctorsData as DoctorRow[]);
        setPatients(patientsData as PatientRow[]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDoctors([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openDoctor = (doctor: DoctorRow) => {
    setViewingDoctor(doctor);
  };

  const assignedPatients = useMemo(() => {
    if (!viewingDoctor) return [];
    return patients.filter((p) => p.assigned_doctor_id === viewingDoctor.id);
  }, [viewingDoctor, patients]);

  const closeModal = () => setViewingDoctor(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Doctors</h1>
      <DashboardCard title="Doctor Directory">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Patients</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    Loading doctors...
                  </TableCell>
                </TableRow>
              ) : doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-zinc-500">
                    No doctors available
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-zinc-900">{d.full_name}</TableCell>
                    <TableCell>{d.specialization || "—"}</TableCell>
                    <TableCell className="text-zinc-600">{d.email}</TableCell>
                    <TableCell>{d.assigned_patient_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDoctor(d)}
                        aria-label={`View patients assigned to ${d.full_name}`}
                      >
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

      {viewingDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Patients assigned to ${viewingDoctor.full_name}`}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{viewingDoctor.full_name}</h2>
                <p className="text-sm text-zinc-600">
                  {viewingDoctor.specialization || "No specialization"}
                  {" · "}
                  {viewingDoctor.email}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              <h3 className="mb-3 text-sm font-medium text-zinc-900">
                Assigned Patients ({assignedPatients.length})
              </h3>
              {assignedPatients.length === 0 ? (
                <p className="text-sm text-zinc-500">No patients assigned.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Symptoms</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedPatients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-zinc-900">{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell className="capitalize">{p.gender}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={p.symptoms || ""}>
                          {p.symptoms || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
