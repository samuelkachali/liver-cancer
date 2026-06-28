"use client";
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, AlertTriangle, Activity } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";
import { api } from "@/lib/api";

interface User {
  id: string;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await api.admin.users();
        setUsers(usersData as User[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUsers = users.length;
  const pendingApprovals = users.filter(u => u.status === 'pending').length;
  const approvedUsers = users.filter(u => u.status === 'verified').length;
  const rejectedUsers = users.filter(u => u.status === 'rejected').length;

  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const colors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#ef4444', '#14b8a6', '#60a5fa'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const count = users.filter(u => {
        const uDate = new Date(u.created_at);
        const diffTime = Math.abs(date.getTime() - uDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
      }).length;
      data.push({ label: dayName, value: count, color: colors[i] });
    }
    return data;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Admin</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Total Users</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : totalUsers}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Approvals</CardTitle><ClipboardList className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : pendingApprovals}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">System Alerts</CardTitle><AlertTriangle className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">0</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Active Sessions</CardTitle><Activity className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : approvedUsers}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">New Users (Last 7 days)</div>
          <BarChart data={getLast7DaysData()} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">System Load Trend</div>
          <LineChart points={[40, 45, 55, 50, 60, 65, 62]} color="#8b5cf6" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Approvals by Status</div>
          <DonutChart
            data={[
              { label: "Pending", value: pendingApprovals, color: "#f59e0b" },
              { label: "Approved", value: approvedUsers, color: "#22c55e" },
              { label: "Rejected", value: rejectedUsers, color: "#ef4444" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
