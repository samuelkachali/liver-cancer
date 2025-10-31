"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creds: Record<string, { pass: string; path: string }> = {
      "nurse@example.com": { pass: "nurse123", path: "/dashboard/nurse" },
      "doctor@example.com": { pass: "doctor123", path: "/dashboard/doctor" },
      "admin@example.com": { pass: "admin123", path: "/dashboard/admin" },
    };
    const found = creds[email?.trim().toLowerCase()];
    if (found && found.pass === password) {
      if (typeof window !== "undefined" && found.path.includes("doctor")) {
        const current = Number(window.localStorage.getItem("assignedPatientsCount") || "6");
        if (!Number.isFinite(current)) window.localStorage.setItem("assignedPatientsCount", "6");
      }
      router.push(found.path);
      return;
    }
    alert("Invalid credentials. Use the demo credentials shown below.");
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="MediVision AI logo" width={28} height={28} />
              <span className="font-semibold">MediVision AI</span>
            </div>
            <CardTitle className="text-2xl text-zinc-900">Login</CardTitle>
            <p className="text-sm text-zinc-600">Smarter cancer detection with machine learning</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Email</label>
                <Input type="email" placeholder="you@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Password</label>
                <Input type="password" placeholder="••••••••" aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all">Sign in</Button>
            </form>
            <div className="mt-4 text-sm text-zinc-600 flex justify-between">
              <Link href="/auth/forgot-password" className="text-blue-700 hover:underline">Forgot password?</Link>
              <Link href="/auth/register" className="text-blue-700 hover:underline">Create account</Link>
            </div>
            <div className="mt-4 text-xs text-zinc-600 border border-zinc-200 rounded-md p-3 bg-zinc-50">
              <div className="font-medium text-zinc-800 mb-1">Demo credentials</div>
              <div>Nurse: nurse@example.com / nurse123 → /dashboard/nurse</div>
              <div>Doctor: doctor@example.com / doctor123 → /dashboard/doctor</div>
              <div>Admin: admin@example.com / admin123 → /dashboard/admin</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
