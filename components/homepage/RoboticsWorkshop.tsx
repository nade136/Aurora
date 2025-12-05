"use client";

import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useTestimonialStore } from "@/store/testimonialStore";
import Image from "next/image";

const testimonials = [
  {
    name: "David Ayomide",
    role: "Core Workshop - Cohort 1",
    quote:
      "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-1.mp4",
  },
  {
    name: "John Ikenna",
    role: "Core Workshop - Cohort 1",
    quote:
      "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-2.mp4",
  },
  {
    name: "Sarah Johnson",
    role: "Core Workshop - Cohort 1",
    quote:
      "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-3.mp4",
  },
];

export default function RoboticsWorkshop() {
  const { currentIndex, setCurrentIndex } = useTestimonialStore();
  const currentTestimonial = testimonials[currentIndex];

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
            ROBOTICS CORE WORKSHOP - 2.0
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Learn with best Mentors in Space
          </p>
        </motion.div>

        {/* Top Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Learn the Right Tools */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[720px] sm:min-h-[820px]">
              <h3 className="text-2xl font-bold text-white mb-4">
                Learn the Right Tools
              </h3>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6">
                From Python to Raspberry Pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>

              {/* Icons */}

              {/* Image composition */}
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
            </div>
          </motion.div>

          {/* Industry relevant skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[400px]">
              <h3 className="text-2xl font-bold text-white mb-4">
                Industry relevant skills
              </h3>
              <p className="text-gray-400 text-sm mb-6 sm:mb-8">
                From Python to Raspberry Pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>

              <div className="mt-auto flex justify-center">
                <Image
                  src="/Image%20/Industry%20skills.svg"
                  alt="Industry skills CTA"
                  width={400}
                  height={56}
                  priority
                  className="mx-auto w-[320px] sm:w-[480px] lg:w-[640px] h-auto"
                />
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

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[420px] sm:min-h-[500px]">
              <h3 className="text-xl font-bold text-white mb-3">
                Hands-on Project
              </h3>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6">
                From Python to Raspberry pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>
              <div className="rounded-lg overflow-hidden grow flex items-center justify-center p-2">
                <Image
                  src="/Image%20/do2%201.svg"
                  alt="Hands-on Project"
                  width={640}
                  height={360}
                  priority
                  className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                />
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
                  ROBOTICS CORE 2.0{" "}
                  <span className="text-gray-400 text-sm sm:text-base">
                    Begins in
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      03
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Hrs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      17
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">Mins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#CCFF00]">
                      03
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
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                  WHO IT&apos;S FOR
                </h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">Students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">
                      Tech-Professionals
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">
                      Robotic Enthusiasts
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">
                      Hardware Developers
                    </span>
                  </li>
                </ul>

                <div className="flex flex-col gap-4">
                  <button className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 w-full justify-center">
                    <span className="text-sm">Register Now</span>
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <ArrowRight className="w-2.5 h-2.5 text-[#CCFF00]" />
                    </div>
                  </button>
                  <div className="text-center">
                    <span className="text-white font-bold text-lg">
                      $32 ONLY
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
              <h3 className="text-xl font-bold text-white mb-3">
                Career Growth
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                From Python to Raspberry Pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>
              <div className="rounded-lg overflow-hidden grow flex items-center justify-center p-2">
                <Image
                  src="/Image%20/i.svg"
                  alt="Career Growth"
                  width={640}
                  height={360}
                  priority
                  className="w-[300px] sm:w-[420px] lg:w-[560px] h-auto"
                />
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
                    TESTIMONIALS
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-white mb-3">
                  PROOF THAT WE DELIVER
                </h3>
                <p className="text-gray-400 text-sm mb-8">
                  What our students say
                </p>

                <button className="mb-8 flex items-center gap-2 text-[#CCFF00] font-semibold text-sm hover:gap-3 transition-all duration-200 w-fit">
                  <span>See More Reviews</span>
                  <div className="w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-black" />
                  </div>
                </button>

                {/* John Ikenna Profile Card */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full" />
                    <div>
                      <div className="text-white font-semibold text-sm">
                        John Ikenna
                      </div>
                      <div className="text-gray-400 text-xs">
                        Core Workshop - Cohort 1
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - Quote Card and Profile */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Quote Card */}
                <div className="border border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-900/30 grow">
                  <div className="text-5xl sm:text-7xl text-gray-600 mb-4 sm:mb-6 leading-none">
                    &ldquo;
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {currentTestimonial.quote}
                  </p>
                </div>

                {/* Profile Card Below Quote */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full" />
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
              </div>

              {/* Right Column - Profile on Top + Large Video */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Profile Card on Top of Video */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-full" />
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

                {/* Large Video (with image) */}
                <div className="relative w-full aspect-3/4 bg-zinc-800 rounded-2xl overflow-hidden">
                  <Image
                    src="/Image%20/Image_fx%20(10)%201.svg"
                    alt="Testimonial video placeholder"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
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
