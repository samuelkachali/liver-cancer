"use client";
import DashboardCard from "@/components/DashboardCard";

export default function NurseReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Reports</h1>
      <DashboardCard title="Recent Reports">
        <div className="text-sm text-zinc-500 py-8 text-center">No reports available yet. Reports will be generated as data is added.</div>
      </DashboardCard>
    </div>
  );
}
