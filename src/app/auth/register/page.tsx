"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    setLoading(true);
    try {
      await api.auth.register({
        email,
        full_name: fullName,
        password,
        role: role as "nurse" | "doctor" | "admin",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md border border-zinc-200 p-6 text-center space-y-4">
            <Image src="/logo.svg" alt="MediVision AI logo" width={40} height={40} className="mx-auto" />
            <h1 className="text-2xl text-zinc-900 font-semibold">Registration Submitted</h1>
            <p className="text-sm text-zinc-600">Your account is pending admin approval. You will be able to log in once an admin verifies your account.</p>
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Login</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md border border-zinc-200">
          <div className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="MediVision AI logo" width={28} height={28} />
                <span className="font-semibold">MediVision AI</span>
              </div>
              <h1 className="text-2xl text-zinc-900 font-semibold">Create Account</h1>
              <p className="text-sm text-zinc-600">Join MediVision AI for smarter oncology workflows</p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" aria-label="Full name" />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" aria-label="Password" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Confirm Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" aria-label="Confirm Password" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Role</label>
                <Select onValueChange={setRole} value={role}>
                  <SelectTrigger aria-label="Role"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" aria-label="Agree to terms" className="h-4 w-4 rounded border-zinc-300" />
                I agree to the terms and privacy policy
              </label>
              <Button type="submit" disabled={loading} className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transition-all">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-4 text-sm text-zinc-600">
              Already have an account? <Link href="/auth/login" className="text-blue-700 hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
