"use client";

import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useTestimonialStore } from "@/store/testimonialStore";

const testimonials = [
  {
    name: "David Ayomide",
    role: "Core Workshop - Cohort 1",
    quote: "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-1.mp4"
  },
  {
    name: "John Ikenna",
    role: "Core Workshop - Cohort 1",
    quote: "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-2.mp4"
  },
  {
    name: "Sarah Johnson",
    role: "Core Workshop - Cohort 1",
    quote: "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facilis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequuntur recusandae.",
    video: "/videos/testimonial-3.mp4"
  }
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

            <div className="relative p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[400px]">
              <h3 className="text-2xl font-bold text-white mb-4">
                Learn the Right Tools
              </h3>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6">
                From Python to Raspberry Pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>

              {/* Icons */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#CCFF00] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xl">A</span>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold">Tux</span>
                </div>
              </div>

              {/* Image placeholder */}
              <div className="bg-zinc-800 rounded-lg p-4 grow flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white font-semibold mb-1 sm:mb-2">Robotics Software Design</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Project Overview</div>
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

              <button className="mt-auto flex items-center gap-2 text-[#CCFF00] font-semibold text-sm hover:gap-3 transition-all duration-200">
                <span>Schedule A Meeting</span>
                <div className="w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-black" />
                </div>
              </button>
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
              <div className="bg-zinc-800 rounded-lg overflow-hidden grow">
                <div className="w-full h-full bg-linear-to-br from-green-400/20 to-blue-500/20 flex items-center justify-center">
                  <div className="text-white text-sm">Hands-on Project Image</div>
                </div>
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
                  <span className="text-gray-400 text-sm sm:text-base">Begins in</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">03</div>
                    <div className="text-xs sm:text-sm text-gray-400">Hrs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">17</div>
                    <div className="text-xs sm:text-sm text-gray-400">Mins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#CCFF00]">03</div>
                    <div className="text-xs sm:text-sm text-gray-400">Secs</div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔔</span>
                  </div>
                </div>
              </div>

              {/* WHO IT'S FOR */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">WHO IT&apos;S FOR</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">Students</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">Tech-Professionals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">Robotic Enthusiasts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                    <span className="text-gray-400 text-sm">Hardware Developers</span>
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
                    <span className="text-white font-bold text-lg">$32 ONLY</span>
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
              <h3 className="text-xl font-bold text-white mb-3">Career Growth</h3>
              <p className="text-gray-400 text-sm mb-6">
                From Python to Raspberry Pi learn from Aurora ist amet. Ad
                molestiae adipisci ut velit corrupti et
              </p>
              <div className="bg-zinc-800 rounded-lg overflow-hidden grow">
                <div className="w-full h-full bg-linear-to-br from-blue-500/20 to-orange-500/20 flex items-center justify-center">
                  <div className="text-white text-4xl">📈</div>
                </div>
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
                  <span className="text-[#CCFF00] text-xs font-medium">TESTIMONIALS</span>
                </div>

                <h3 className="text-3xl font-bold text-white mb-3">
                  PROOF THAT WE DELIVER
                </h3>
                <p className="text-gray-400 text-sm mb-8">What our students say</p>

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
                      <div className="text-white font-semibold text-sm">John Ikenna</div>
                      <div className="text-gray-400 text-xs">Core Workshop - Cohort 1</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - Quote Card and Profile */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Quote Card */}
                <div className="border border-zinc-800 rounded-2xl p-6 sm:p-8 bg-zinc-900/30 grow">
                  <div className="text-5xl sm:text-7xl text-gray-600 mb-4 sm:mb-6 leading-none">&ldquo;</div>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {currentTestimonial.quote}
                  </p>
                </div>

                {/* Profile Card Below Quote */}
                <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full" />
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">{currentTestimonial.name}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">{currentTestimonial.role}</div>
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
                      <div className="text-white font-semibold text-sm sm:text-base">{currentTestimonial.name}</div>
                      <div className="text-gray-400 text-xs sm:text-sm">{currentTestimonial.role}</div>
                    </div>
                  </div>
                </div>

                {/* Large Video */}
                <div className="relative w-full aspect-3/4 bg-zinc-800 rounded-2xl overflow-hidden">
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
                      ? 'w-8 h-1 bg-[#CCFF00]'
                      : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
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
