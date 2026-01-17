import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  Award,
  ShieldCheck,
  Grid3X3,
  CheckCircle2,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Internships at Aurora",
  description:
    "Learn how internships work at Aurora Robotics and what we look for in potential interns.",
};

export default function InternshipsPage() {
  return (
    <div className="font-sans text-white bg-black min-h-screen">
      <Navbar />

      <section className="mt-32">
        <div className="mx-auto w-[calc(100%-1rem)] sm:w-auto">
          <div className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black h-[380px] max-w-7xl md:min-w-[100px]">
            <div className="absolute inset-0 pointer-events-none select-none">
              <Image
                src="/Image%20/Internships.svg"
                alt="Aurora internships background"
                fill
                priority
                sizes="100vw"
                className="object-contain object-left opacity-80"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-black/60" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black to-transparent" />
            <div className="relative h-full px-6 md:px-16 py-56">
              <div className="grid gap-8 md:gap-0 md:grid-cols-3 items-end">
                <div className="md:col-span-2">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                    INTERNSHIPS AT AURORA
                  </h1>
                  <p className="mt-4 text-zinc-300 max-w-2xl">
                    Thank you for your interest in the Aurora Robotics
                    Internship.
                  </p>
                  <div className="mt-6 h-px w-full bg-white/25" />
                </div>
                <div className="md:col-span-1 md:border-l md:border-white/20">
                  <div className="md:pl-6">
                    <p className="text-zinc-300 md:text-left">
                      You being on this page shows a genuine curiosity about
                      being part of Aurora. That matters.
                    </p>
                    <div className="mt-6 h-px bg-white/20 md:-ml-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <div className="h-full p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
              HOW INTERNSHIPS WORK AT AURORA ROBOTICS
            </h2>
            <p className="mt-4 text-zinc-300 md:text-lg leading-relaxed max-w-xl">
              At Aurora Robotics, internships are not applied for! It’s
              important to understand how internships work here — because Aurora
              Robotics does not follow the conventional internship model.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 sm:p-8 h-full">
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#CCFF00]" />
              </div>
              <h3 className="text-2xl font-semibold">
                Internships are Awarded
              </h3>
            </div>
            <p className="mt-4 text-zinc-300 md:text-base">
              This is intentional. Before anyone becomes an intern, we believe
              they must first understand what Aurora is at its core:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-1 text-zinc-300 md:text-base">
              <li>our philosophy</li>
              <li>methodology</li>
              <li>vision</li>
              <li>work ethic</li>
            </ul>
            <p className="mt-4 text-zinc-300">
              An Aurora internship is not an entry point; it is a continuation
              of proven alignment.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-[#CCFF00]" />
              </div>
              <h3 className="text-2xl font-semibold">Active Participation</h3>
            </div>
            <p className="mt-4 text-zinc-300 md:text-base">
              Eligibility for an Aurora Robotics internship begins with active
              participation in — and love for — Aurora’s work. Those who are
              noticed are people who explore Aurora, contribute in public, and
              engage in the environments that reflect how Aurora operates in
              practice.
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-1 text-zinc-300 md:text-base">
              <li>Curiosity and depth of thinking</li>
              <li>Discipline and consistency</li>
              <li>Problem‑solving approach</li>
              <li>Technical engagement</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
              </div>
              <h3 className="text-2xl font-semibold">
                Alignment with values and standards
              </h3>
            </div>
            <p className="mt-4 text-zinc-300 md:text-base">
              Stewardship opportunities are extended only to individuals who
              stand for the common good and who show a clear fit with the Aurora
              ecosystem.
            </p>
          </div>
        </div>

        {/* Pathway to becoming an Aurora intern */}
        <section className="rounded-2xl border border-white/10 bg-zinc-900/30 p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
              PATHWAY TO BECOMING AN AURORA INTERN
            </h3>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base">
              This process ensures that every intern at Aurora is prepared,
              aligned, and capable of contributing meaningfully.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-[28px_1fr] gap-x-6 gap-y-10">
            {/* Step 1 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-[-40px] w-px bg-white/15" />
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">
                Participate in an Aurora workshop
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-[-40px] w-px bg-white/15" />
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">
                Engage fully and consistently
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-[-40px] w-px bg-white/15" />
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 " />
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">
                Demonstrate initiative, focus and alignment
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 " />
                </div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">
                Be recognized and invited
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-6 text-zinc-400">
            <p className="text-sm sm:text-base">
              To stay informed about upcoming workshops and programs, we
              encourage you to follow Aurora Robotics on our official social
              media channels and turn on notifications. All announcements and
              opportunities are communicated through those platforms.
            </p>
            <p className="text-sm sm:text-base">
              Aurora Robotics is deliberate about the people it brings to its
              community. If this approach resonates with you, we look forward to
              seeing you engage with our work, participate in our programs, and
              allow your commitment and growth speak for you.
            </p>
            <p className="text-sm sm:text-base">
              That is how internships begin at Aurora Robotics.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-white font-semibold">
              Follow us on Social Media
            </p>
            <div className="flex items-center gap-3">
              <a
                aria-label="Instagram"
                href="#"
                className="inline-flex w-9 h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                aria-label="YouTube"
                href="#"
                className="inline-flex w-9 h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                aria-label="Twitter"
                href="#"
                className="inline-flex w-9 h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                aria-label="LinkedIn"
                href="#"
                className="inline-flex w-9 h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
