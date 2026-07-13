"use client";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Missing or invalid reset token");
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing or invalid reset token");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image src="/liver.jpg" width={800} height={600} alt="Medical healthcare illustration" className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-r from-blue-900/60 to-blue-900/30" />
          <div className="absolute bottom-12 left-12 text-white max-w-sm">
            <h2 className="text-3xl font-bold mb-3">All set</h2>
            <p className="text-blue-100">Your password has been updated. Sign in with your new credentials.</p>
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
              <CardTitle className="text-3xl text-zinc-900">Password updated</CardTitle>
              <p className="text-zinc-600">Your password has been reset successfully.</p>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all text-base font-medium">
                  Back to login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image src="/liver.jpg" width={800} height={600} alt="Medical healthcare illustration" className="object-cover" priority />
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
            <CardTitle className="text-3xl text-zinc-900">Reset password</CardTitle>
            <p className="text-zinc-600">Choose a new password for your account</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">New password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  aria-label="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Confirm password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  aria-label="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all text-base font-medium"
                disabled={loading || !token}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
            <div className="mt-6 text-sm text-zinc-600 text-center">
              Back to <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-zinc-600">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
