"use client";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorMedicationRecsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Medication Recommendations</h1>
      <DashboardCard title="For Current Case">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Primary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">Sorafenib — 400mg twice daily. Monitor LFT weekly.</CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Supportive Care</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">Analgesics as needed. Nutritional support and hydration.</CardContent>
          </Card>
        </div>
      </DashboardCard>
    </div>
  );
}
