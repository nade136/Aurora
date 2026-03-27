"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#CCFF00] leading-tight">
            To Reach Out for Inquires or Quote for Our Services and Products
          </h1>
          <p className="mt-5 text-gray-300 text-base sm:text-lg leading-relaxed">
            In order to get quotes on our services and products or to speak to a
            representative, kindly contact us through any of the channels below.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 sm:col-span-3">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-[#CCFF00]" />
              <h2 className="text-lg font-semibold">Email</h2>
            </div>
            <a
              href="mailto:aurora.robotique@gmail.com"
              className="text-gray-200 hover:text-[#CCFF00] transition-colors"
            >
              aurora.robotique@gmail.com
            </a>
          </div>

          <Link
            href="https://www.linkedin.com/company/aurora-robotics-in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 hover:border-[#CCFF00]/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-[#CCFF00]" />
              <span className="text-lg font-semibold">LinkedIn</span>
            </div>
          </Link>

          <Link
            href="https://x.com/aurora_robots"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-zinc-900/40 p-5 hover:border-[#CCFF00]/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex w-5 h-5 items-center justify-center text-[#CCFF00] font-bold">
                X
              </span>
              <span className="text-lg font-semibold">X</span>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
