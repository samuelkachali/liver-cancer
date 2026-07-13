"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  file_url: string | null;
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DoctorDiagnosisPage() {
  const searchParams = useSearchParams();
  const presetPatientId = searchParams.get("patient") || "";

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(presetPatientId);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [result, setResult] = useState<{ type: string; conf: number; at: string; scan_url?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.patients.list();
        const mapped = (data as PatientOption[]).map((p) => ({
          id: p.id,
          hospital_number: p.hospital_number,
          name: p.name,
          file_url: p.file_url ?? null,
        }));
        setPatients(mapped);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;
  const hasImage = extraImages.length > 0 || Boolean(selectedPatient?.file_url);

  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const dataUrls = await Promise.all(Array.from(files).map(readImageAsDataUrl));
    setExtraImages((prev) => [...prev, ...dataUrls]);
  };

  const handleRun = async () => {
    if (!selectedPatientId) return;
    const image = extraImages[0] ?? selectedPatient?.file_url ?? null;
    if (!image) return;
    setLoading(true);
    try {
      const response = await api.diagnoses.runAi(selectedPatientId, image);
      const created = response as any;
      setResult({
        type: created.cancer_type || "liver",
        conf: Number(created.confidence),
        at: new Date(created.created_at).toLocaleString(),
        scan_url: created.scan_url ?? null,
      });
    } catch (error) {
      console.error("Failed to run diagnosis:", error);
    } finally {
      setLoading(false);
    }
  };

  const resultImages: string[] = (() => {
    if (!result?.scan_url) return [];
    try {
      const parsed = JSON.parse(result.scan_url);
      return Array.isArray(parsed) ? parsed : [result.scan_url];
    } catch {
      return [result.scan_url];
    }
  })();

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

          {selectedPatient?.file_url && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-zinc-700">Patient Image</div>
              <img
                src={selectedPatient.file_url}
                alt={`${selectedPatient.name} image`}
                className="h-48 w-full rounded-lg border border-zinc-200 object-cover"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700">Add Extra Images (optional)</div>
            <Input
              id="scan"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleAddImages(e.target.files)}
            />
            {extraImages.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {extraImages.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img src={src} alt={`extra ${idx + 1}`} className="h-24 w-full rounded-lg border border-zinc-200 object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove image ${idx + 1}`}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                      onClick={() => setExtraImages((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleRun}
            disabled={!selectedPatientId || !hasImage || loading}
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
            {resultImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {resultImages.map((src, idx) => (
                  <img key={idx} src={src} alt={`scan ${idx + 1}`} className="h-24 w-full rounded-lg border border-zinc-200 object-cover" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DoctorDiagnosisPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-zinc-600">Loading...</div>}>
      <DoctorDiagnosisPage />
    </Suspense>
  );
}
