"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, Brain, Stethoscope, FileText, ClipboardList, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white">
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="MediVision AI logo" width={28} height={28} />
            <span className="text-xl font-semibold text-zinc-900">MediVision AI</span>
          </div>
          <div>
            <Link href="/auth/login" aria-label="Login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="pt-24">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
              AI-Assisted Liver Cancer Detection
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              A role-based clinical interface for nurses, doctors, and admins to manage patients, upload scans, and generate diagnostic reports.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all">Get Started</Button>
              </Link>
              <Link href="#how" aria-label="Learn more" className="inline-flex">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all">Explore Features</Button>
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="rounded-xl border border-zinc-200 p-6 shadow-sm bg-white">
            <Image src="/liver.jpg" alt="Medical AI visualization" width={800} height={600} className="w-full h-auto" />
          </motion.div>
          {/* Floating medical icons */}
          <motion.div className="absolute z-0" initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 1 }}>
            {/* Decorative icons via CSS background are lighter; using SVGs from lucide would require rendering components. We'll keep subtle visuals handled by the hero illustration. */}
          </motion.div>
        </section>
        {/* How It Works (horizontal steps) */}
        <section id="how" className="py-20 bg-gradient-to-b from-gray-50 to-blue-50/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 text-center">How MediVision Works</h2>
            <div className="mt-8 rounded-3xl bg-white/80 p-6 md:p-8 border border-blue-100 shadow-md ring-1 ring-blue-100/60">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {[
                { icon: Upload, title: "Upload Scan", text: "Securely upload imaging data" },
                { icon: Brain, title: "AI Analysis", text: "Model predicts likely class" },
                { icon: Stethoscope, title: "Doctor Review", text: "Clinicians validate" },
                { icon: FileText, title: "Report Generated", text: "Structured diagnostic report" },
              ].map((s, i, arr) => (
                <div key={s.title} className="flex-1 flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 ring-1 ring-blue-100 shadow">
                    <s.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{s.title}</div>
                    <div className="text-sm text-zinc-600">{s.text}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block h-12 w-px bg-blue-100/80 ml-4" />
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Roles (no cards) */}
        <section id="features" className="py-16 bg-blue-50/50">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 text-center">Who Uses MediVision AI</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              <Link href="/dashboard/nurse" className="group block rounded-2xl bg-white border border-blue-100/60 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 border border-blue-100">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-lg font-semibold text-zinc-900 group-hover:scale-105 transition">Nurse</div>
                <div className="text-zinc-600">Patient management & doctor assignment</div>
              </Link>
              <Link href="/dashboard/doctor" className="group block rounded-2xl bg-white border border-blue-100/60 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 border border-blue-100">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-lg font-semibold text-zinc-900 group-hover:scale-105 transition">Doctor</div>
                <div className="text-zinc-600">Diagnosis, AI verification, report generation</div>
              </Link>
              <Link href="/dashboard/admin" className="group block rounded-2xl bg-white border border-blue-100/60 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 border border-blue-100">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-lg font-semibold text-zinc-900 group-hover:scale-105 transition">Admin</div>
                <div className="text-zinc-600">User management & verification</div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl bg-blue-600 text-white py-12 px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <h3 className="text-2xl font-semibold">Join the Future of AI-Powered Diagnostics</h3>
              <p className="mt-2 text-white/80">Trusted, accurate, and clinician-friendly.</p>
              <div className="mt-6">
                <Link href="/auth/register">
                  <Button className="bg-white text-blue-700 hover:bg-white/90 font-semibold">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-zinc-600 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} MediVision AI</span>
            <span>Powered by MediVision AI – Intelligent Clinical Solutions</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
