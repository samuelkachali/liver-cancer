"use client";
import DashboardCard from "@/components/DashboardCard";
import PatientForm from "@/components/PatientForm";

export default function NurseAddPatientPage() {
  return (
    <div className="space-y-6">
      <DashboardCard title="Add Patient">
        <PatientForm />
      </DashboardCard>
    </div>
  );
}
