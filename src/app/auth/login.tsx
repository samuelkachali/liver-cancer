"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Email</label>
                <Input type="email" placeholder="you@example.com" aria-label="Email" />
              </div>
              <div>
                <label className="block text-sm text-zinc-700 mb-1">Password</label>
                <Input type="password" placeholder="••••••••" aria-label="Password" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all">Sign in</Button>
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
