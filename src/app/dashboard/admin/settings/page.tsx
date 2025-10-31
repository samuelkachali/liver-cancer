"use client";
import DashboardCard from "@/components/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">System Settings</h1>
      <DashboardCard title="General Configuration">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Organization Name</label>
            <Input placeholder="e.g. MediVision Health" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Support Email</label>
            <Input type="email" placeholder="support@example.com" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Data Retention (days)</label>
            <Input type="number" placeholder="30" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Settings</Button>
        </div>
      </DashboardCard>
    </div>
  );
}
