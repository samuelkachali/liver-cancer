import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportCard({ title, content }: { title: string; content: string }) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-zinc-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-700 whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
}
