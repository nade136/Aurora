"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function BookSlot() {
  const searchParams = useSearchParams();
  const cohort = searchParams.get("cohort") || "";
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold">Registering for this cohort gives you lifetime access</h1>
          <p className="text-gray-400 mt-2">to all resources released during this cohort</p>
          {cohort && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C6FF00] text-[#C6FF00] text-xs">
              <span>Cohort:</span>
              <span className="font-semibold">{cohort}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="bg-[#C6FF00] text-black font-semibold px-5 py-2 rounded-lg hover:bg-[#b8e600]">Learn More</button>
            <button className="bg-transparent border border-white/30 text-white font-semibold px-5 py-2 rounded-lg hover:bg-white/5">Meet the Tutor</button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Form */}
          <form className="space-y-5">
            <input type="hidden" name="cohort" value={cohort} />
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#C6FF00] mb-2">First Name</label>
                <input className="w-full bg-transparent border border-[#C6FF00] rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <input className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">✎</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <input type="email" className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="john@doe.com" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">✉</span>
              </div>
            </div>

            {/* Tertiary Institution */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tertiary Institution</label>
              <input className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="Tertiary Institution attended" />
            </div>

            {/* Current/Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current/Role</label>
                <input className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="Put N/A if currently unemployed" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white outline-none">
                  <option className="bg-black">Student/Intern</option>
                  <option className="bg-black">Graduate</option>
                  <option className="bg-black">Professional</option>
                </select>
              </div>
            </div>

            {/* Socials */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Social Media</label>
              <input className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="LinkedIn URL" />
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button type="button" className="w-full bg-[#C6FF00] hover:bg-[#b8e600] text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                <span>Pay $32 Now</span>
                <span className="w-2 h-2 bg-black rounded-full inline-block" />
              </button>
            </div>
          </form>

          {/* Gain Access */}
          <div className="mt-14">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <h3 className="text-white text-2xl font-semibold">Gain Access</h3>
                <p className="text-gray-400 text-sm mt-1">To have access to this cohort, you pay a fee of $32 or NGN50,000</p>
              </div>
              <button type="button" className="bg-[#C6FF00] hover:bg-[#b8e600] text-black font-bold px-8 py-4 rounded-xl flex items-center gap-2 w-full md:w-auto justify-center">
                Pay $32 Now
                <span className="w-2 h-2 bg-black rounded-full inline-block" />
              </button>
            </div>

            {/* Logos row */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment methods */}
              <div className="border border-white/30 rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]" />
                  <span>Secured by Paystack</span>
                </div>
                <div className="flex items-center gap-6">
                  <Image src="/payments/visa.svg" alt="Visa" width={96} height={32} />
                  <Image src="/payments/mastercard.svg" alt="Mastercard" width={96} height={32} />
                  <Image src="/payments/verve.svg" alt="Verve" width={96} height={32} />
                  <Image src="/payments/applepay.svg" alt="Apple Pay" width={96} height={32} />
                </div>
              </div>

              {/* Sponsors */}
              <div className="border border-white/30 rounded-xl p-5">
                <div className="text-xs text-gray-400 mb-4">Our Sponsors</div>
                <div className="flex items-center gap-6">
                  <Image src="/Image /Regalia.svg" alt="Regalia" width={120} height={40} />
                  <Image src="/Image /ChatGPT Image Aug 12, 2025, 02_50_20 PM 1.svg" alt="Partner" width={48} height={48} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
