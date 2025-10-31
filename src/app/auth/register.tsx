"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center p-8">
        <Image src="/hero-medical.svg" alt="Medical AI" width={700} height={500} className="rounded-xl border border-zinc-200 shadow-sm bg-white" />
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card className="shadow-md">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="MediVision AI logo" width={28} height={28} />
                <span className="font-semibold">MediVision AI</span>
              </div>
              <CardTitle className="text-2xl text-zinc-900">Create Account</CardTitle>
              <p className="text-sm text-zinc-600">Join MediVision AI for smarter oncology workflows</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Full name</label>
                  <Input placeholder="Your name" aria-label="Full name" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Email</label>
                  <Input type="email" placeholder="you@example.com" aria-label="Email" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-zinc-700 mb-1">Password</label>
                    <Input type="password" placeholder="••••••••" aria-label="Password" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-700 mb-1">Confirm Password</label>
                    <Input type="password" placeholder="••••••••" aria-label="Confirm Password" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-700 mb-1">Role</label>
                  <Select>
                    <SelectTrigger aria-label="Role"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" aria-label="Agree to terms" className="h-4 w-4 rounded border-zinc-300" />
                  I agree to the terms and privacy policy
                </label>
                <Button type="submit" className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transition-all">Create account</Button>
              </form>
              <div className="mt-4 text-sm text-zinc-600">
                Already have an account? <Link href="/auth/login" className="text-blue-700 hover:underline">Login</Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
