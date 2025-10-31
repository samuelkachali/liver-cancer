"use client";
import DashboardCard from "@/components/DashboardCard";
import PatientForm from "@/components/PatientForm";

export default function NurseAddPatientPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Add Patient</h1>
      <DashboardCard title="Add Patient">
        <PatientForm />
      </DashboardCard>
    </div>
  );
}
