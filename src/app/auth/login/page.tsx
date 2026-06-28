"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.auth.login(email, password) as { access_token: string; user: { role: string } };
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      const rolePath: Record<string, string> = {
        nurse: "/dashboard/nurse",
        doctor: "/dashboard/doctor",
        admin: "/dashboard/admin",
      };

      if (rolePath[response.user.role]) {
        router.push(rolePath[response.user.role]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
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
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Email</label>
                <Input type="email" placeholder="you@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Password</label>
                <Input type="password" placeholder="••••••••" aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-sm text-zinc-600 flex justify-between">
              <Link href="/auth/forgot-password" className="text-blue-700 hover:underline">Forgot password?</Link>
              <Link href="/auth/register" className="text-blue-700 hover:underline">Create account</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
