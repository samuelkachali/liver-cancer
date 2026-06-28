"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Stethoscope,
  Users2,
  LayoutDashboard,
  Home,
  UserPlus,
  ClipboardList,
  FileText,
  Settings,
  Inbox,
  Brain,
  Activity,
  Users,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";

interface UserInfo {
  full_name: string;
  email: string;
  role: string;
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const pathname = usePathname();
  const isNurse = pathname?.startsWith("/dashboard/nurse");
  const isDoctor = pathname?.startsWith("/dashboard/doctor");
  const isAdmin = pathname?.startsWith("/dashboard/admin");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await api.auth.me();
        const u = data as any;
        setUser({ full_name: u.full_name || "", email: u.email || "", role: u.role || "" });
      } catch {
        // ignore
      }
    };
    fetchMe();
  }, []);

  const nav = isNurse
    ? [
        { href: "/dashboard/nurse", label: "Dashboard Overview", icon: Home },
        { href: "/dashboard/nurse/add-patient", label: "Add Patient", icon: UserPlus },
        { href: "/dashboard/nurse/assign-doctor", label: "Assign Doctor", icon: Stethoscope },
        { href: "/dashboard/nurse/patients", label: "Patients List", icon: ClipboardList },
        { href: "/dashboard/nurse/reports", label: "Reports", icon: FileText },
        { href: "/dashboard/nurse/settings", label: "Settings", icon: Settings },
      ]
    : isDoctor
    ? [
        { href: "/dashboard/doctor", label: "Dashboard Overview", icon: Home },
        { href: "/dashboard/doctor/assigned", label: "Assigned Patients", icon: Inbox },
        { href: "/dashboard/doctor/diagnosis", label: "Diagnosis", icon: Brain },
        { href: "/dashboard/doctor/past", label: "Past Diagnoses", icon: Activity },
        { href: "/dashboard/doctor/meds", label: "Medication Recs", icon: ClipboardList },
        { href: "/dashboard/doctor/settings", label: "Settings", icon: Settings },
      ]
    : isAdmin
    ? [
        { href: "/dashboard/admin", label: "Admin Overview", icon: Home },
        { href: "/dashboard/admin/users", label: "User Management", icon: Users },
        { href: "/dashboard/admin/approvals", label: "Approvals", icon: UserPlus },
        { href: "/dashboard/admin/logs", label: "Activity Logs", icon: Activity },
        { href: "/dashboard/admin/settings", label: "System Settings", icon: Settings },
        { href: "/dashboard/admin/access", label: "Access Control", icon: Shield },
      ]
    : [
        { href: "/dashboard/nurse", label: "Nurse Dashboard", icon: Users2 },
        { href: "/dashboard/doctor", label: "Doctor Dashboard", icon: Stethoscope },
        { href: "/dashboard/admin", label: "Admin Dashboard", icon: LayoutDashboard },
      ];

  const initials = user
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : isDoctor
    ? "DR"
    : isAdmin
    ? "AD"
    : "N";

  const displayName = user?.full_name || (isDoctor ? "Dr. Doctor" : isAdmin ? "Admin User" : "Nurse User");
  const displayEmail = user?.email || (isDoctor ? "doctor@example.com" : isAdmin ? "admin@example.com" : "nurse@example.com");

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    window.addEventListener("open-sidebar", openHandler as EventListener);
    window.addEventListener("close-sidebar", closeHandler as EventListener);
    return () => {
      window.removeEventListener("open-sidebar", openHandler as EventListener);
      window.removeEventListener("close-sidebar", closeHandler as EventListener);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-0 sm:w-64 md:w-20 lg:w-64 border-0 sm:border-r border-zinc-200 bg-white overflow-visible transition-all z-80">
      <div className="h-14 px-4 border-b border-zinc-200 flex items-center gap-2">
        <Image src="/logo.svg" alt="MediVision AI" width={20} height={20} />
        <span className="text-sm font-semibold text-zinc-900 hidden lg:inline">MediVision AI</span>
      </div>
      <nav className="hidden sm:block px-0 py-3 space-y-1" aria-label="Sidebar navigation">
        {nav.map(({ href, label, icon: Icon }, idx) => {
          const roleBase = isNurse ? "/dashboard/nurse" : isDoctor ? "/dashboard/doctor" : isAdmin ? "/dashboard/admin" : "";
          const isOverviewItem = idx === 0 && href === roleBase;
          const active = isOverviewItem ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-6 py-2 text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition-all",
                active && "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-blue-50">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-zinc-900">{displayName}</div>
                <div className="text-xs text-zinc-500">{displayEmail}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-44 z-90">
            <DropdownMenuItem asChild>
              <Link href={isNurse ? "/dashboard/nurse/settings" : isDoctor ? "/dashboard/doctor/settings" : "/dashboard/admin/settings"}>Edit Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">Sign Out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className={cn("fixed inset-0 z-70 bg-black/20", open ? "block sm:hidden" : "hidden")}
        onClick={() => {
          setOpen(false);
          window.dispatchEvent(new Event("close-sidebar"));
        }}
      />
      <div className={cn("fixed z-70 top-0 left-0 h-screen w-64 bg-white border-r border-zinc-200 shadow-md", open ? "block sm:hidden" : "hidden")} role="dialog" aria-label="Sidebar menu">
        <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MediVision AI" width={20} height={20} />
            <span className="text-sm font-semibold text-zinc-900">MediVision AI</span>
          </div>
          <button
            aria-label="Close sidebar"
            className="rounded-md p-1 hover:bg-zinc-100"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("close-sidebar"));
            }}
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-2 pb-20">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700 transition"
              href={href}
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("close-sidebar"));
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-3 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium text-zinc-900">{displayName}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={isNurse ? "/dashboard/nurse/settings" : isDoctor ? "/dashboard/doctor/settings" : "/dashboard/admin/settings"}
              className="flex-1 text-center rounded-md border px-3 py-1.5 hover:bg-blue-50"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("close-sidebar"));
              }}
            >
              Edit Profile
            </Link>
            <Link
              href="/"
              className="flex-1 text-center rounded-md border px-3 py-1.5 hover:bg-zinc-100"
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("close-sidebar"));
              }}
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
