"use client";
import DashboardCard from "@/components/DashboardCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminAccessControlPage() {
  const matrix = [
    { role: "Nurse", permissions: ["Add Patient", "Assign Doctor", "View Reports"] },
    { role: "Doctor", permissions: ["View Assigned", "Run Diagnosis", "Write Notes"] },
    { role: "Admin", permissions: ["Manage Users", "System Settings", "Access Control"] },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Access Control</h1>
      <DashboardCard title="Roles and Permissions">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Default Route</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map(r => (
                <TableRow key={r.role}>
                  <TableCell>{r.role}</TableCell>
                  <TableCell className="text-sm text-zinc-700">{r.permissions.join(", ")}</TableCell>
                  <TableCell className="text-right">
                    <Select>
                      <SelectTrigger className="w-52" aria-label={`Default route for ${r.role}`}><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse">/dashboard/nurse</SelectItem>
                        <SelectItem value="doctor">/dashboard/doctor</SelectItem>
                        <SelectItem value="admin">/dashboard/admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardCard>
    </div>
  );
}
