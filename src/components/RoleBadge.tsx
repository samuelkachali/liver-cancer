import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function RoleBadge({ role, className, ...props }: { role: "Nurse" | "Doctor" | "Admin" } & HTMLAttributes<HTMLSpanElement>) {
  const color = role === "Admin" ? "bg-blue-600" : role === "Doctor" ? "bg-blue-500" : "bg-blue-400";
  return (
    <span {...props} className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white", color, className)}>
      {role}
    </span>
  );
}
