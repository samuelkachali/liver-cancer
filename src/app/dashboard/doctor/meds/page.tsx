"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

interface DiagnosisEntry {
  id: string;
  cancer_type: string;
  confidence: number;
  created_at: string;
}

export default function DoctorMedicationRecsPage() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const data = await api.diagnoses.list();
        const mapped = (data as any[]).map((d) => ({
          id: d.id,
          cancer_type: d.cancer_type,
          confidence: Number(d.confidence),
          created_at: d.created_at,
        }));
        setDiagnoses(mapped);
      } catch (error) {
        console.error("Failed to fetch diagnoses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiagnoses();
  }, []);

  const latest = diagnoses[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Medication Recommendations</h1>
      {loading ? (
        <DashboardCard title="Loading">
          <div className="text-sm text-zinc-500 py-8 text-center">Loading...</div>
        </DashboardCard>
      ) : !latest ? (
        <DashboardCard title="For Current Case">
          <div className="text-sm text-zinc-500 py-8 text-center">
            No diagnoses available yet. Medication recommendations will appear after a diagnosis is recorded.
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard title={`For Case ${latest.id}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Primary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600">
                Liver cancer case (confidence {latest.confidence.toFixed(1)}%). Consult specialist for treatment protocol.
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600">
                Regular liver function tests and imaging follow-up recommended based on current diagnosis.
              </CardContent>
            </Card>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
