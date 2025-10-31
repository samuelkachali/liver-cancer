"use client";
import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function DoctorUploadPage() {
  const [fileName, setFileName] = useState<string>("");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Upload Scan</h1>
      <DashboardCard title="Upload New Scan">
        <div className="space-y-3">
          <Input type="file" accept="image/*" onChange={(e)=> setFileName(e.target.files?.[0]?.name || "")} />
          {fileName && <div className="text-xs text-zinc-500">Selected: {fileName}</div>}
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Notes</label>
            <Textarea rows={3} placeholder="Optional notes about this scan" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Upload</Button>
        </div>
      </DashboardCard>
    </div>
  );
}
