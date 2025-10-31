"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Timer, Mail, CalendarCheck } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";

export default function DoctorDashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Doctor</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Assigned Patients</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">6</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Results</CardTitle><Timer className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">1</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">New Messages</CardTitle><Mail className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">0</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Follow-ups Today</CardTitle><CalendarCheck className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">2</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Appointments This Week</div>
          <BarChart
            data={[
              { label: "Mon", value: 2, color: "#60a5fa" },
              { label: "Tue", value: 4, color: "#34d399" },
              { label: "Wed", value: 3, color: "#f59e0b" },
              { label: "Thu", value: 5, color: "#a78bfa" },
              { label: "Fri", value: 4, color: "#ef4444" },
              { label: "Sat", value: 1, color: "#14b8a6" },
              { label: "Sun", value: 0, color: "#60a5fa" },
            ]}
          />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Diagnosis Confidence Trend</div>
          <LineChart points={[70, 72, 75, 78, 80, 82, 85]} color="#3b82f6" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Cases by Status</div>
          <DonutChart
            data={[
              { label: "Waiting", value: 5, color: "#f59e0b" },
              { label: "In Review", value: 7, color: "#60a5fa" },
              { label: "Completed", value: 12, color: "#22c55e" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
