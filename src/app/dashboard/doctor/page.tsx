"use client";
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Timer, Mail, CalendarCheck } from "lucide-react";
import { BarChart, LineChart, DonutChart } from "@/components/Charts";
import { api } from "@/lib/api";

interface Patient {
  id: string;
  assigned_doctor_id: string;
}

interface Diagnosis {
  id: string;
  status: string;
  confidence: number;
}

export default function DoctorDashboardPage() {
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

  const assignedPatients = patients.length;
  const pendingResults = diagnoses.filter(d => d.status === 'pending').length;
  const completedDiagnoses = diagnoses.filter(d => d.status === 'completed').length;
  const inReviewDiagnoses = diagnoses.filter(d => d.status === 'reviewed').length;

  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const colors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#ef4444', '#14b8a6', '#60a5fa'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      data.push({ label: dayName, value: Math.floor(Math.random() * 5), color: colors[i] });
    }
    return data;
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, Doctor</h1>
        <p className="text-sm text-zinc-600">Here’s a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Assigned Patients</CardTitle><Users className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : assignedPatients}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Pending Results</CardTitle><Timer className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : pendingResults}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">New Messages</CardTitle><Mail className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">0</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Follow-ups Today</CardTitle><CalendarCheck className="h-4 w-4 text-blue-600"/></CardHeader>
          <CardContent className="py-4 text-2xl font-semibold text-blue-600">{loading ? '-' : completedDiagnoses}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Appointments This Week</div>
          <BarChart data={getLast7DaysData()} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Diagnosis Confidence Trend</div>
          <LineChart points={diagnoses.slice(0, 7).map(d => d.confidence)} color="#3b82f6" />
        </div>
        <div className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="text-sm font-medium text-zinc-900 mb-3">Cases by Status</div>
          <DonutChart
            data={[
              { label: "Waiting", value: pendingResults, color: "#f59e0b" },
              { label: "In Review", value: inReviewDiagnoses, color: "#60a5fa" },
              { label: "Completed", value: completedDiagnoses, color: "#22c55e" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
