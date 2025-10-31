"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, Bell } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";

export default function NurseDashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Nurse</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Patients Today</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">8</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Assignments</CardTitle><ClipboardList className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">3</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">New Reports</CardTitle><FileText className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">2</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Alerts</CardTitle><Bell className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">0</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Patients Admitted (Last 7 days)</div>
          <BarChart
            data={[
              { label: "Mon", value: 3, color: "#60a5fa" },
              { label: "Tue", value: 5, color: "#34d399" },
              { label: "Wed", value: 4, color: "#f59e0b" },
              { label: "Thu", value: 6, color: "#a78bfa" },
              { label: "Fri", value: 2, color: "#ef4444" },
              { label: "Sat", value: 1, color: "#14b8a6" },
              { label: "Sun", value: 2, color: "#60a5fa" },
            ]}
          />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Triage Completion Rate</div>
          <LineChart points={[50, 65, 62, 72, 80, 78, 85]} color="#22c55e" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Cases by Department</div>
          <DonutChart
            data={[
              { label: "General", value: 18, color: "#60a5fa" },
              { label: "Oncology", value: 10, color: "#f59e0b" },
              { label: "Radiology", value: 8, color: "#34d399" },
              { label: "Other", value: 6, color: "#a78bfa" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
