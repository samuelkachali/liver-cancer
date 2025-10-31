"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PatientForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [doctor, setDoctor] = useState("");
  const [patientId, setPatientId] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [fileName, setFileName] = useState<string>("");

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Patient Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Patient ID / Hospital Number</label>
        <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g. HN-2025-001" />
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Age</label>
        <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 45" />
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Gender</label>
        <Select onValueChange={setGender}>
          <SelectTrigger aria-label="Gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-700 mb-1">Contact Number</label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. +44 7700 900123" />
        </div>
        <div>
          <label className="block text-sm text-zinc-700 mb-1">Address</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Medical Ave" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Symptoms</label>
        <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe symptoms" rows={3} />
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Upload Patient File (optional)</label>
        <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
        {fileName && <p className="mt-1 text-xs text-zinc-500">Selected: {fileName}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-700 mb-1">Assign Doctor</label>
        <Input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="e.g. Dr. Smith" />
      </div>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
    </form>
  );
}
