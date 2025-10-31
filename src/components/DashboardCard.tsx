import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-zinc-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
