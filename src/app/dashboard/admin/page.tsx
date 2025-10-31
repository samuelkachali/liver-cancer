"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, AlertTriangle, Activity } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";

export default function AdminDashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Admin</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Total Users</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">42</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Approvals</CardTitle><ClipboardList className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">4</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">System Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">1</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Active Sessions</CardTitle><Activity className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">7</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">New Users (Last 7 days)</div>
          <BarChart
            data={[
              { label: "Mon", value: 2, color: "#60a5fa" },
              { label: "Tue", value: 3, color: "#34d399" },
              { label: "Wed", value: 1, color: "#f59e0b" },
              { label: "Thu", value: 4, color: "#a78bfa" },
              { label: "Fri", value: 2, color: "#ef4444" },
              { label: "Sat", value: 1, color: "#14b8a6" },
              { label: "Sun", value: 0, color: "#60a5fa" },
            ]}
          />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">System Load Trend</div>
          <LineChart points={[40, 45, 55, 50, 60, 65, 62]} color="#8b5cf6" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Approvals by Status</div>
          <DonutChart
            data={[
              { label: "Pending", value: 4, color: "#f59e0b" },
              { label: "Approved", value: 12, color: "#22c55e" },
              { label: "Rejected", value: 2, color: "#ef4444" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
