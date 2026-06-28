"use client";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, FileText, Bell } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  created_at: string;
  assigned_doctor_id: string | null;
}

interface Diagnosis {
  id: string;
  created_at: string;
}

export default function NurseDashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, diagnosesData] = await Promise.all([
          api.patients.list(),
          api.diagnoses.list(),
        ]);
        setPatients(patientsData as Patient[]);
        setDiagnoses(diagnosesData as Diagnosis[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const patientsToday = patients.filter(p => new Date(p.created_at) >= today).length;
  const pendingAssignments = patients.filter(p => !p.assigned_doctor_id).length;
  const newReports = diagnoses.filter(d => new Date(d.created_at) >= today).length;

  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const colors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#ef4444', '#14b8a6', '#60a5fa'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const count = patients.filter(p => {
        const pDate = new Date(p.created_at);
        pDate.setHours(0, 0, 0, 0);
        return pDate.getTime() === date.getTime();
      }).length;
      data.push({ label: dayName, value: count, color: colors[i] });
    }
    return data;
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Nurse</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Patients Today</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : patientsToday}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Assignments</CardTitle><ClipboardList className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : pendingAssignments}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">New Reports</CardTitle><FileText className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : newReports}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Alerts</CardTitle><Bell className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">0</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Patients Admitted (Last 7 days)</div>
          <BarChart data={getLast7DaysData()} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Triage Completion Rate</div>
          <LineChart points={[50, 65, 62, 72, 80, 78, 85]} color="#22c55e" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Cases by Department</div>
          <DonutChart
            data={[
              { label: "General", value: patients.length, color: "#60a5fa" },
              { label: "Oncology", value: diagnoses.length, color: "#f59e0b" },
              { label: "Radiology", value: 0, color: "#34d399" },
              { label: "Other", value: 0, color: "#a78bfa" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
