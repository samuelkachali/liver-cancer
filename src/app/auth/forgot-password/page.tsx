"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="rounded-xl border border-zinc-200 p-6 shadow-sm bg-white">
          <h1 className="text-2xl font-semibold text-zinc-900">Reset Password</h1>
          <form className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-zinc-700 mb-1">Email</label>
              <Input type="email" placeholder="you@example.com" aria-label="Email" />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Reset Link</Button>
          </form>
          <div className="mt-4 text-sm text-zinc-600">
            Back to <Link href="/auth/login" className="text-blue-700 hover:underline">Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
