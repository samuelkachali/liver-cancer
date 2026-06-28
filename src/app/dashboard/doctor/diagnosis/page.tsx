"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

interface PatientOption {
  id: string;
  hospital_number: string;
  name: string;
}

export default function DoctorDiagnosisPage() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [confidence, setConfidence] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{ type: string; conf: number; at: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.patients.list();
        const mapped = (data as any[]).map((p) => ({
          id: p.id,
          hospital_number: p.hospital_number,
          name: p.name,
        }));
        setPatients(mapped);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const handleRun = async () => {
    if (!selectedPatientId || !confidence) return;
    setLoading(true);
    try {
      const conf = parseFloat(confidence);
      const response = await api.diagnoses.create({
        patient_id: selectedPatientId,
        confidence: conf,
        scan_url: fileName || undefined,
      });
      const created = response as any;
      setResult({
        type: created.cancer_type || "liver",
        conf: Number(created.confidence),
        at: new Date(created.created_at).toLocaleString(),
      });
    } catch (error) {
      console.error("Failed to run diagnosis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Diagnosis</h1>
      <DashboardCard title="Run Diagnosis">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700">Patient</div>
            <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
              <SelectTrigger className="w-full" id="patient" aria-label="Select patient">
                <SelectValue placeholder="Select an assigned patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.hospital_number} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700">Confidence (%)</div>
            <Input
              id="confidence"
              type="number"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              placeholder="0 - 100"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700">Upload Scan</div>
            <Input
              id="scan"
              type="file"
              accept="image/*"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
            {fileName && <div className="text-xs text-zinc-500">Selected: {fileName}</div>}
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleRun}
            disabled={!selectedPatientId || !confidence || loading}
          >
            {loading ? "Running..." : "Run Diagnosis"}
          </Button>
        </div>
      </DashboardCard>
      {result && (
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-zinc-900">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-600">Predicted Cancer Type</div>
                <div className="text-xl font-semibold text-zinc-900">{result.type}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-600 text-right">Confidence</div>
                <div className="text-xl font-semibold text-zinc-900 text-right">{result.conf.toFixed(1)}%</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">{result.at}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
