"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="MediVision AI logo" width={28} height={28} />
          <Link href="/" className="text-lg font-semibold text-zinc-900">MediVision AI</Link>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
