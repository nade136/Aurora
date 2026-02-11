"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="border border-white/10 rounded-2xl p-8 md:p-10 bg-black/60 shadow-lg shadow-[#CCFF00]/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CCFF00] text-[#CCFF00] text-xs mb-4">
              Registration Complete
            </div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-3">
              You have successfully registered
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Thank you for registering. You will be contacted soon via email
              with the next steps.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#CCFF00] text-black font-semibold hover:bg-[#b8e600]"
              >
                Back to Home
              </Link>
              <Link
                href="/workshop"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5"
              >
                View Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
