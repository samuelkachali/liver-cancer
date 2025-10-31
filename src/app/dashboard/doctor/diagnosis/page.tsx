"use client";
import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorDiagnosisPage() {
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{ type: string; conf: number; at: string } | null>(null);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Diagnosis</h1>
      <DashboardCard title="Upload Scan and Run AI">
        <div className="space-y-3">
          <Input type="file" accept="image/*" onChange={(e)=> setFileName(e.target.files?.[0]?.name || "")} />
          {fileName && <div className="text-xs text-zinc-500">Selected: {fileName}</div>}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={()=> setResult({ type: "Liver", conf: 92, at: new Date().toLocaleString() })}>Run AI Diagnosis</Button>
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
                <div className="text-xl font-semibold text-zinc-900 text-right">{result.conf}%</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">{result.at}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
