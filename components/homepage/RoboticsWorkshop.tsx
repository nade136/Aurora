"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTestimonialStore } from "@/store/testimonialStore";
import Image from "next/image";
import Link from "next/link";
import { type TestimonialsBlock, type WorkshopBlock } from "@/lib/schemas/home";
import { mediaPublicUrl } from "@/utils/media";
type Props = {
  workshop?: WorkshopBlock;
  testimonials?: TestimonialsBlock;
};

export default function RoboticsWorkshop({
  workshop: w,
  testimonials: t,
}: Props) {
  const { currentIndex, setCurrentIndex } = useTestimonialStore();

  const toUrl = (p?: string | null) => {
    if (!p) return "";
    if (p.startsWith("http") || p.startsWith("/")) return p;
    return mediaPublicUrl(p) || "";
  };

  const items = (t?.items || []).map((it) => ({
    name: it.name,
    role: it.role || "",
    quote: it.text || "",
    avatar: toUrl(it.avatar),
    video: toUrl(it.videoUrl),
  }));

  const fallback = [
    {
      name: "David Ayomide",
      role: "Core Workshop - Cohort 1",
      quote:
        "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
      avatar: "",
      video: "/videos/testimonial-1.mp4",
    },
  ];

  const data = items.length > 0 ? items : fallback;
  const currentTestimonial = data[Math.min(currentIndex, data.length - 1)];
  const [showAll, setShowAll] = useState(false);
  const remaining = Math.max(0, items.length - 3);

  // Countdown (live) based on workshop.whoItsFor.countdownTargetISO
  const [startTs, setStartTs] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);
  useEffect(() => {
    setStartTs(Date.now());
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const targetISO = w?.whoItsFor?.countdownTargetISO;
  const targetTs = targetISO ? new Date(targetISO).getTime() : 0;
  const elapsed = startTs > 0 ? tick * 1000 : 0;
  const diffMs = targetISO ? Math.max(0, targetTs - (startTs + elapsed)) : 0;
  const hrs = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  const secs = Math.floor((diffMs % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <motion.div
          className="text-center mb-10 sm:mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            {w?.title || "ROBOTICS CORE WORKSHOP - 2.0"}
          </h2>
          {(w?.subtitle || "Learn with best Mentors in Space") && (
            <p className="text-gray-400 text-sm sm:text-base">
              {w?.subtitle || "Learn with best Mentors in Space"}
            </p>
          )}
        </motion.div>

        {/* Top Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {/* Left Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group hover:bg-opacity-10 hover:bg-white/5 transition-all duration-300 p-4 rounded-lg"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
            >
              <path
                d="M 2,2 L 398,2 L 398,360 L 360,398 L 2,398 Z"
                fill="none"
                stroke="rgb(39, 39, 42)"
                strokeWidth="2"
              />
            </svg>

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[720px] sm:min-h-[820px]">
              <h3 className="text-2xl font-bold text-white mb-4 hover-react">
                {w?.leftFeature?.title || "Learn the Right Tools"}
              </h3>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6 hover-react group-hover:text-white">
                {w?.leftFeature?.text ||
                  "From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et"}
              </p>

              {/* Icons */}

              {/* Media (leftFeature) or fallback composition */}
              {w?.leftFeature?.media?.src ? (
                <div className="rounded-lg overflow-hidden grow flex items-center justify-center p-2">
                  {w.leftFeature.media.kind === "video" ? (
                    <video
                      src={toUrl(w.leftFeature.media.src)}
                      poster={
                        toUrl(w.leftFeature.media.poster || "") || undefined
                      }
                      controls
                      playsInline
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  ) : (
                    <Image
                      src={
                        toUrl(w.leftFeature.media.src) ||
                        "/Image%20/do2%201.svg"
                      }
                      alt={w.leftFeature.title || "Left feature"}
                      width={640}
                      height={360}
                      priority
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  )}
                </div>
              ) : (
                <div className="relative  rounded-lg grow">
                  {/* connectors (diamond) */}
                  <svg
                    className="absolute inset-0 w-full h-full z-0"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    {/* Top -> Left */}
                    <line
                      x1="50"
                      y1="18"
                      x2="12"
                      y2="58"
                      stroke="rgb(82,82,91)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    {/* Top -> Right */}
                    <line
                      x1="50"
                      y1="18"
                      x2="88"
                      y2="58"
                      stroke="rgb(82,82,91)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    {/* Left -> Bottom */}
                    <line
                      x1="12"
                      y1="58"
                      x2="50"
                      y2="90"
                      stroke="rgb(82,82,91)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    {/* Right -> Bottom */}
                    <line
                      x1="88"
                      y1="58"
                      x2="50"
                      y2="90"
                      stroke="rgb(82,82,91)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                  </svg>

                  {/* nodes */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[18%] z-10">
                    <div className="rounded-full ring-1 ring-zinc-500/30 p-1 bg-transparent">
                      <Image
                        src="/Image%20/Logo%20circle.svg"
                        alt="Aurora Logo"
                        width={128}
                        height={128}
                        priority
                      />
                    </div>
                  </div>

                  <div className="absolute left-[10%] sm:left-[12%] top-[58%] -translate-y-1/2 z-10">
                    <div className="rounded-full ring-1 ring-zinc-500/30 p-1 bg-transparent">
                      <Image
                        src="/Image%20/Logo%20circle%20(1).svg"
                        alt="GitHub Circle"
                        width={120}
                        height={120}
                      />
                    </div>
                  </div>

                  <div className="absolute right-[10%] sm:right-[12%] top-[58%] -translate-y-1/2 z-10">
                    <div className="rounded-full ring-1 ring-zinc-500/30 p-1 bg-transparent">
                      <Image
                        src="/Image%20/Logo%20circle%20(2).svg"
                        alt="ROS2 Circle"
                        width={120}
                        height={120}
                      />
                    </div>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 top-[90%] -translate-y-1/2 z-10">
                    <div className="rounded-full ring-1 ring-zinc-500/30 p-1 bg-transparent">
                      <Image
                        src="/Image%20/Logo%20circle%20(3).svg"
                        alt="Linux Tux Circle"
                        width={128}
                        height={128}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Industry relevant skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group hover:bg-opacity-10 hover:bg-white/5 transition-all duration-300 p-4 rounded-lg"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
            >
              <path
                d="M 2,2 L 398,2 L 398,360 L 360,398 L 2,398 Z"
                fill="none"
                stroke="rgb(39, 39, 42)"
                strokeWidth="2"
              />
            </svg>

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[400px]">
              <h3 className="text-2xl font-bold text-white mb-4 hover-react">
                {w?.rightFeature?.title || "Industry relevant skills"}
              </h3>
              <p
                className={
                  "text-gray-400 text-sm mb-6 sm:mb-8 hover-react group-hover:text-white"
                }
              >
                {w?.rightFeature?.text ||
                  "From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et"}
              </p>

              <div className="mt-auto flex justify-center">
                {w?.rightFeature?.media?.src ? (
                  w.rightFeature.media.kind === "video" ? (
                    <video
                      src={toUrl(w.rightFeature.media.src)}
                      poster={
                        toUrl(w.rightFeature.media.poster || "") || undefined
                      }
                      controls
                      playsInline
                      className="mx-auto w-[320px] sm:w-[480px] lg:w-[640px] h-auto"
                    />
                  ) : (
                    <Image
                      src={
                        toUrl(w.rightFeature.media.src) ||
                        "/Image%20/Industry%20skills.svg"
                      }
                      alt={w.rightFeature.title || "Industry relevant skills"}
                      width={400}
                      height={56}
                      priority
                      className="mx-auto w-[320px] sm:w-[480px] lg:w-[640px] h-auto"
                    />
                  )
                ) : (
                  <Image
                    src="/Image%20/Industry%20skills.svg"
                    alt="Industry skills CTA"
                    width={400}
                    height={56}
                    priority
                    className="mx-auto w-[320px] sm:w-[480px] lg:w-[640px] h-auto"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Row - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Left - Hands-on Project */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group hover:bg-opacity-10 hover:bg-white/5 transition-all duration-300 p-4 rounded-lg"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
            >
              <path
                d="M 2,2 L 398,2 L 398,360 L 360,398 L 2,398 Z"
                fill="none"
                stroke="rgb(39, 39, 42)"
                strokeWidth="2"
              />
            </svg>

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[420px] sm:min-h-[500px]">
              <h3 className="text-xl font-bold text-white mb-3 hover-react">
                {w?.handsOn?.title || "Hands-on Project"}
              </h3>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6 hover-react group-hover:text-white">
                {w?.handsOn?.text ||
                  "From Python to Raspberry pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et"}
              </p>
              <div className="rounded-lg overflow-hidden grow flex items-center justify-center p-2">
                {w?.handsOn?.media?.src ? (
                  w.handsOn.media.kind === "video" ? (
                    <video
                      src={toUrl(w.handsOn.media.src)}
                      poster={toUrl(w.handsOn.media.poster || "") || undefined}
                      controls
                      playsInline
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  ) : (
                    <Image
                      src={
                        toUrl(w.handsOn.media.src) || "/Image%20/do2%201.svg"
                      }
                      alt={w.handsOn.title || "Hands-on Project"}
                      width={640}
                      height={360}
                      priority
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  )
                ) : (
                  <Image
                    src="/Image%20/do2%201.svg"
                    alt="Hands-on Project"
                    width={640}
                    height={360}
                    priority
                    className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Middle - ROBOTICS CORE 2.0 + WHO IT'S FOR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative group"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
            >
              <path
                d="M 2,2 L 398,2 L 398,360 L 360,398 L 2,398 Z"
                fill="none"
                stroke="rgb(39, 39, 42)"
                strokeWidth="2"
              />
            </svg>

            <div className="relative p-8 flex flex-col min-h-[500px]">
              {/* ROBOTICS CORE 2.0 Badge */}
              <div className="border border-zinc-700 rounded-lg p-4 mb-6">
                <div className="text-white font-semibold mb-3">
                  {w?.title || "ROBOTICS CORE 2.0"}{" "}
                  <span className="text-gray-400 text-sm sm:text-base">
                    {w?.whoItsFor?.countdownLabel || "Begins in"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {pad(hrs)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Hrs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {pad(mins)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Mins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#CCFF00]">
                      {pad(secs)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Secs</div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔔</span>
                  </div>
                </div>
              </div>

              {/* WHO IT'S FOR */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 hover-react">
                  WHO IT&apos;S FOR
                </h3>
                <ul className="space-y-2 mb-6">
                  {(w?.whoItsFor?.bullets?.length
                    ? w.whoItsFor.bullets
                    : [
                        "Students",
                        "Tech-Professionals",
                        "Robotic Enthusiasts",
                        "Hardware Developers",
                      ]
                  ).map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                      <span className="text-gray-400 text-sm">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-4">
                  <Link
                    href={w?.whoItsFor?.cta?.url || "/book-slot?cohort=core-2"}
                    className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 w-full justify-center"
                  >
                    <span className="text-sm">
                      {w?.whoItsFor?.cta?.label || "Register Now"}
                    </span>
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-[#CCFF00]" />
                    </div>
                  </Link>
                  <div className="text-center">
                    <span className="text-white font-bold text-lg">
                      {w?.whoItsFor?.priceLabel || "$32 ONLY"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Career Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group hover:bg-opacity-10 hover:bg-white/5 transition-all duration-300 p-4 rounded-lg"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 400 400"
            >
              <path
                d="M 2,2 L 398,2 L 398,360 L 360,398 L 2,398 Z"
                fill="none"
                stroke="rgb(39, 39, 42)"
                strokeWidth="2"
              />
            </svg>

            <div className="relative p-8 flex flex-col min-h-[500px]">
              <h3 className="text-xl font-bold text-white mb-3 hover-react">
                {w?.careerGrowth?.title || "Career Growth"}
              </h3>
              <p className="text-gray-400 text-sm mb-6 hover-react group-hover:text-white">
                {w?.careerGrowth?.text ||
                  "From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et"}
              </p>
              <div className="rounded-lg overflow-hidden grow flex items-center justify-center p-2">
                {w?.careerGrowth?.media?.src ? (
                  w.careerGrowth.media.kind === "video" ? (
                    <video
                      src={toUrl(w.careerGrowth.media.src)}
                      poster={
                        toUrl(w.careerGrowth.media.poster || "") || undefined
                      }
                      controls
                      playsInline
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  ) : (
                    <Image
                      src={toUrl(w.careerGrowth.media.src) || "/Image%20/i.svg"}
                      alt={w.careerGrowth.title || "Career Growth"}
                      width={640}
                      height={360}
                      priority
                      className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                    />
                  )
                ) : (
                  <Image
                    src="/Image%20/i.svg"
                    alt="Career Growth"
                    width={640}
                    height={360}
                    priority
                    className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Proof That We Deliver Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative"
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 1200 400"
          >
            <path
              d="M 2,2 L 1198,2 L 1198,360 L 1160,398 L 2,398 Z"
              fill="none"
              stroke="rgb(39, 39, 42)"
              strokeWidth="2"
            />
          </svg>

          <div className="relative p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Header and Profile Card */}
              <div className="lg:col-span-4 flex flex-col">
                {/* Badge */}
                <div className="inline-block px-4 py-1 border border-[#CCFF00] rounded-full mb-4 w-fit">
                  <span className="text-[#CCFF00] text-xs font-medium">
                    {t?.badgeLabel || "TESTIMONIALS"}
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-white mb-3 hover-react">
                  {t?.title || "PROOF THAT WE DELIVER"}
                </h3>
                <p className="text-gray-400 text-sm mb-8 hover-react group-hover:text-white">
                  {t?.subtitle || "What our students say"}
                </p>

                {items.length > 3 && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    aria-expanded={showAll}
                    aria-controls="testimonials-list"
                    className="mb-6 flex items-center gap-2 text-[#CCFF00] font-semibold text-sm hover:gap-3 transition-all duration-200 w-fit"
                  >
                    <span>
                      {showAll ? "See less" : `See ${remaining} more reviews`}
                    </span>
                    <div className="w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                      <ArrowRight
                        className={`w-3 h-3 text-black transition-transform ${
                          showAll ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                )}

                {/* People list - click to switch */}
                <div id="testimonials-list" className="relative space-y-2">
                  {(showAll ? items : items.slice(0, 3)).map((it, i) => (
                    <button
                      key={`${it.name}-${i}`}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-full text-left border border-zinc-800 rounded-2xl p-3 bg-zinc-900/50 hover:bg-zinc-900 transition ${
                        i === currentIndex ? "ring-1 ring-[#CCFF00]/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {it?.avatar ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={toUrl(it.avatar)}
                              alt={it.name || "Testimonial author"}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-orange-500 rounded-full" />
                        )}
                        <div>
                          <div className="text-white font-semibold text-sm line-clamp-1">
                            {it?.name || "Anonymous"}
                          </div>
                          <div className="text-gray-400 text-xs line-clamp-1">
                            {it?.role || ""}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!showAll && items.length > 3 && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl" />
                  )}
                </div>
              </div>

              {/* Center Column - Quote Card and Profile */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Quote Card */}
                <div className="border border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-900/30 grow">
                  <div className="text-5xl sm:text-7xl text-gray-600 mb-4 sm:mb-6 leading-none">
                    &ldquo;
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed hover-react group-hover:text-white">
                    {currentTestimonial?.quote || t?.leadQuote || ""}
                  </p>
                </div>

                {/* Profile Card Below Quote */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    {currentTestimonial?.avatar ? (
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                        <Image
                          src={toUrl(currentTestimonial.avatar)}
                          alt={currentTestimonial?.name || "Testimonial author"}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full" />
                    )}
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {currentTestimonial?.name}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm">
                        {currentTestimonial?.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile on Top + Large Video */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Profile Card on Top of Video */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    {currentTestimonial?.avatar ? (
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden">
                        <Image
                          src={toUrl(currentTestimonial.avatar)}
                          alt={currentTestimonial?.name || "Testimonial author"}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-full" />
                    )}
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm">
                        {currentTestimonial.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Large Video/Image uses current testimonial first, then section fallbacks */}
                <div className="relative w-full aspect-3/4 bg-zinc-800 rounded-2xl overflow-hidden">
                  {currentTestimonial?.video ? (
                    <video
                      src={toUrl(currentTestimonial.video)}
                      poster={
                        toUrl(t?.heroPoster) || toUrl(t?.heroImage) || undefined
                      }
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : t?.heroVideo ? (
                    <video
                      src={toUrl(t?.heroVideo)}
                      poster={
                        toUrl(t?.heroPoster) || toUrl(t?.heroImage) || undefined
                      }
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : t?.heroPoster || t?.heroImage ? (
                    <Image
                      src={
                        toUrl(t?.heroPoster) ||
                        toUrl(t?.heroImage) ||
                        "/Image%20/Image_fx%20(10)%201.svg"
                      }
                      alt="Testimonial media"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <Image
                      src="/Image%20/Image_fx%20(10)%201.svg"
                      alt="Testimonial video placeholder"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {data.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 h-1 bg-[#CCFF00]"
                      : "w-2 h-2 bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
