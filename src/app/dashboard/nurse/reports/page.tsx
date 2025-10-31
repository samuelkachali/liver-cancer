"use client";
import DashboardCard from "@/components/DashboardCard";

export default function NurseReportsPage() {
  const reports = [
    { id: "RPT-01", title: "Weekly Admissions", date: "2025-10-25" },
    { id: "RPT-02", title: "Pending Assignments", date: "2025-10-28" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Reports</h1>
      <DashboardCard title="Recent Reports">
        <ul className="space-y-2 text-sm">
          {reports.map(r => (
            <li key={r.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span>{r.title}</span>
              <span className="text-zinc-500">{r.date}</span>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}
