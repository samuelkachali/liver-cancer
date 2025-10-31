"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RoleBadge from "@/components/RoleBadge";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignedCount, setAssignedCount] = useState<number>(0);
  const pathname = usePathname();
  const role: "Nurse" | "Doctor" | "Admin" = pathname?.startsWith("/dashboard/nurse")
    ? "Nurse"
    : pathname?.startsWith("/dashboard/admin")
    ? "Admin"
    : "Doctor";
  const initials = role === "Doctor" ? "DR" : role === "Admin" ? "AD" : "N";
  // Sync drawer state with Sidebar events
  useEffect(() => {
    const onOpen = () => setDrawerOpen(true);
    const onClose = () => setDrawerOpen(false);
    window.addEventListener("open-sidebar", onOpen as EventListener);
    window.addEventListener("close-sidebar", onClose as EventListener);
    return () => {
      window.removeEventListener("open-sidebar", onOpen as EventListener);
      window.removeEventListener("close-sidebar", onClose as EventListener);
    };
  }, []);

  // Load doctor assigned patients count (placeholder/local value)
  useEffect(() => {
    if (role === "Doctor") {
      const stored = Number((typeof window !== "undefined" && window.localStorage.getItem("assignedPatientsCount")) || "");
      if (Number.isFinite(stored) && stored >= 0) {
        setAssignedCount(stored);
      } else {
        setAssignedCount(6);
      }
    } else {
      setAssignedCount(0);
    }
  }, [role]);
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="pl-0 md:pl-20 lg:pl-64">
        <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                className={drawerOpen ? "hidden" : "sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-100"}
                onClick={() => {
                  window.dispatchEvent(new Event("open-sidebar"));
                  setDrawerOpen(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-zinc-700"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div className="text-sm text-zinc-600">Dashboard</div>
            </div>
            <div className="flex items-center gap-3">
              {role === "Doctor" && (
                <Link href="/dashboard/doctor/assigned" className="relative inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100" aria-label={assignedCount > 0 ? `${assignedCount} assigned patients` : "No assigned patients"}>
                  <Bell className="h-5 w-5 text-zinc-700" />
                  {assignedCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
                      {assignedCount > 99 ? "99+" : assignedCount}
                    </span>
                  )}
                </Link>
              )}
              <RoleBadge role={role} aria-label="Current role" />
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
