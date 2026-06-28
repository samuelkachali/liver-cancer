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
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/liver.jpg"  
          width={800} 
          height={600} 
          alt="Medical healthcare illustration"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/60 to-blue-900/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-sm">
          <h2 className="text-3xl font-bold mb-3">AI-Powered Oncology Care</h2>
          <p className="text-blue-100">Advanced liver cancer detection and patient management with machine learning assistance.</p>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="MediVision AI logo" width={36} height={36} />
              <span className="font-bold text-xl text-blue-900">MediVision AI</span>
            </div>
            <CardTitle className="text-3xl text-zinc-900">Welcome back</CardTitle>
            <p className="text-zinc-600">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all text-base font-medium"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 flex justify-between text-sm">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline font-medium">
                Forgot password?
              </Link>
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}