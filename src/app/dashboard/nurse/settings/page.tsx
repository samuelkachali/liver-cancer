"use client";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NurseSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
      <DashboardCard title="Profile Settings">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Display Name</label>
            <Input placeholder="e.g. Nurse Nancy" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Contact Number</label>
            <Input placeholder="e.g. +44 7700 900123" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
        </div>
      </DashboardCard>
    </div>
  );
}
