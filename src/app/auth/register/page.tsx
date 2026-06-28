"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password || !confirmPassword || !role) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await api.auth.register({
        email,
        full_name: fullName,
        password,
        role: role as "nurse" | "doctor" | "admin",
      });
      setSuccess(true);
    } catch (err: unknown) {
      let msg = "Registration failed";
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") msg = e.message;
        else if (typeof e.detail === "string") msg = e.detail;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <Image src="/logo.svg" alt="MediVision AI logo" width={56} height={56} className="mx-auto" />
          <h1 className="text-3xl font-bold text-zinc-900">Registration Submitted</h1>
          <p className="text-zinc-600 max-w-sm mx-auto">
            Your account is pending admin approval. You will be able to log in once an admin verifies your account.
          </p>
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">Back to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold mb-3">Join MediVision AI</h2>
          <p className="text-blue-100">Create your account for smarter oncology workflows and patient care.</p>
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
            <CardTitle className="text-3xl text-zinc-900">Create Account</CardTitle>
            <p className="text-zinc-600">Join MediVision AI for smarter oncology workflows</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" aria-label="Full name" disabled={loading} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" disabled={loading} className="h-11" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" aria-label="Password" disabled={loading} className="h-11" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Confirm Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" aria-label="Confirm Password" disabled={loading} className="h-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Role</label>
                <Select onValueChange={setRole} value={role} disabled={loading}>
                  <SelectTrigger aria-label="Role" className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" aria-label="Agree to terms" className="h-4 w-4 rounded border-zinc-300" />
                I agree to the terms and privacy policy
              </label>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white transition-all text-base font-medium">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-6 text-sm text-zinc-600 text-center">
              Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}