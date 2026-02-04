"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

function BookSlotInner() {
  const searchParams = useSearchParams();
  const cohort = searchParams.get("cohort") || "";
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [price, setPrice] = useState<{ amount: number; currency: string } | null>(null);
  const [activeCohort, setActiveCohort] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [roleCategory, setRoleCategory] = useState("Student/Intern");
  const [socialUrl, setSocialUrl] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("payment_settings")
        .select("amount, currency, current_cohort, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      const rows = (data as Array<{ amount?: number; currency?: string; current_cohort?: string | null }>) || [];
      const found = rows.find((r) => typeof r?.amount === "number" && !!r?.currency);
      if (found) {
        setPrice({ amount: Number(found.amount || 0), currency: String(found.currency) });
        setActiveCohort(String(found.current_cohort || ""));
      }
    };
    load();
  }, [supabase]);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    console.log("[book-slot] reference from URL", ref);
    if (!ref) return;
    const verify = async () => {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(ref)}`, { cache: "no-store" });
        const json = await res.json();
        console.log("[book-slot] verify response", { ok: res.ok, status: res.status, json });
        if (json?.ok && json?.status === "success") {
          alert("Payment successful. We will contact you via email.");
        } else {
          alert("Payment verification failed. If you were charged, please contact support.");
        }
      } catch {
        alert("Could not verify payment. Please contact support if you were charged.");
      }
    };
    verify();
  }, []);

  const startPayment = async () => {
    if (!price) { alert("Price not available yet."); return; }
    if (!email) { alert("Please enter your email."); return; }
    setPaying(true);
    try {
      const cohortValue = (activeCohort || cohort || "").trim() || null;
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price.amount,
          currency: price.currency || "NGN",
          email,
          cohort: cohortValue,
          first_name: firstName,
          last_name: lastName,
          institution,
          current_position: currentPosition,
          role_category: roleCategory,
          social_url: socialUrl,
          callback_url: `${window.location.origin}/book-slot`,
        }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json?.error || "Failed to start payment"); return; }
      if (json?.authorization_url) {
        window.location.href = json.authorization_url as string;
      } else {
        alert("Could not get authorization URL");
      }
    } catch {
      alert("Could not start payment.");
    } finally {
      setPaying(false);
    }
  };

  const priceLabel = price ? `${price.currency} ${Number(price.amount || 0).toLocaleString()}` : "NGN 50,000";
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
            <a
              href="https://bakel-bakel.github.io/aurora-robotics-core-2.0-website/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#C6FF00] hover:bg-[#b8e600] text-black font-semibold px-5 py-2 rounded-lg"
            >
              Learn More
            </a>
            <a
              href="https://www.linkedin.com/in/bakel-bakel-6341a7150/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border border-white/30 text-white font-semibold px-5 py-2 rounded-lg hover:bg-white/5"
            >
              Meet the Tutor
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Form */}
          <form className="space-y-5" onSubmit={(e)=>{e.preventDefault(); startPayment();}}>
            <input type="hidden" name="cohort" value={cohort} />
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#C6FF00] mb-2">First Name</label>
                <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="w-full bg-transparent border border-[#C6FF00] rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">✎</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="john@doe.com" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">✉</span>
              </div>
            </div>

            {/* Tertiary Institution */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tertiary Institution</label>
              <input value={institution} onChange={(e)=>setInstitution(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="Tertiary Institution attended" />
            </div>

            {/* Current/Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current/Role</label>
                <input value={currentPosition} onChange={(e)=>setCurrentPosition(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="Put N/A if currently unemployed" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select value={roleCategory} onChange={(e)=>setRoleCategory(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white outline-none">
                  <option className="bg-black" value="Student/Intern">Student/Intern</option>
                  <option className="bg-black" value="Graduate">Graduate</option>
                  <option className="bg-black" value="Professional">Professional</option>
                </select>
              </div>
            </div>

            {/* Socials */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Social Media</label>
              <input value={socialUrl} onChange={(e)=>setSocialUrl(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-500 outline-none" placeholder="LinkedIn URL" />
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button type="submit" disabled={paying} className="w-full bg-[#C6FF00] hover:bg-[#b8e600] disabled:opacity-60 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2">
                <span>{paying ? "Redirecting…" : `Pay ${priceLabel} Now`}</span>
                <span className="w-2 h-2 bg-black rounded-full inline-block" />
              </button>
            </div>
          </form>

          {/* Gain Access */}
          <div className="mt-14">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <h3 className="text-white text-2xl font-semibold">Gain Access</h3>
                <p className="text-gray-400 text-sm mt-1">To have access to this cohort, you pay a fee of {priceLabel}</p>
              </div>
              <button type="button" onClick={startPayment} disabled={paying} className="bg-[#C6FF00] hover:bg-[#b8e600] disabled:opacity-60 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-2 w-full md:w-auto justify-center">
                {paying ? "Redirecting…" : `Pay ${priceLabel} Now`}
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

export default function BookSlot() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black"><Navbar /></div>}>
      <BookSlotInner />
    </Suspense>
  );
}
