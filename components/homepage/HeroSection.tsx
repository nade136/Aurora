"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "../Navbar";

export default function HeroSection() {
  return (
    <section className="relative mx-2 mt-4 sm:mx-4 sm:mt-5 lg:mx-6 lg:mt-6">
      {/* Mobile-only: same shape but with slightly curved bottom left/right edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 sm:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
        style={{
          filter: `
            drop-shadow(0 0 20px rgba(0, 217, 255, 0.5))
            drop-shadow(0 0 40px rgba(0, 217, 255, 0.3))
            drop-shadow(0 0 60px rgba(0, 217, 255, 0.2))
          `,
        }}
      >
        <path
          d="M 24,2
             L 976,2
             Q 998,2 998,24
             L 998,560
             Q 998,580 980,580
             L 600,580
             L 550,544
             L 450,544
             L 400,580
             L 20,580
             Q 2,580 2,560
             L 2,24
             Q 2,2 24,2 Z"
          fill="none"
          stroke="#00D9FF"
          strokeWidth="2"
        />
      </svg>
      {/* Custom Border with Notch using SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 hidden sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
        style={{
          filter: `
            drop-shadow(0 0 20px rgba(0, 217, 255, 0.5))
            drop-shadow(0 0 40px rgba(0, 217, 255, 0.3))
            drop-shadow(0 0 60px rgba(0, 217, 255, 0.2))
          `,
        }}
      >
        <path
          d="M 24,2 
             L 976,2 
             Q 998,2 998,24 
             L 998,576
             L 600,576
             L 550,540
             L 450,540
             L 400,576
             L 2,576
             L 2,24 
             Q 2,2 24,2 Z"
          fill="none"
          stroke="#00D9FF"
          strokeWidth="2"
        />
      </svg>

      <div
        className="relative overflow-hidden"
        style={{
          clipPath:
            "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), 60% calc(100% - 24px), 55% calc(100% - 60px), 45% calc(100% - 60px), 40% calc(100% - 24px), 0 calc(100% - 24px), 0 24px)",
          borderRadius: "24px",
          boxShadow: `inset 0 0 30px rgba(0, 217, 255, 0.1)`,
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-black">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-black via-zinc-900 to-black opacity-90" />
        </div>

        {/* Navbar inside bordered container */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Video Background - Full Width Blended */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="/Image /Whisk_mtyzqjyhrgm1mwzj1in5emytuwzzqtl4imy30sy.mp4"
              type="video/mp4"
            />
          </video>
          {/* Gradient overlay for blending */}
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 flex items-center min-h-[520px] sm:min-h-[680px] lg:min-h-[870px]">
          <div className="max-w-lg md:max-w-xl">
            {/* Main Heading */}
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              ACCELERATE YOUR
              <br />
              ROBOTICS CAREER
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Learn robotics through practical live training sessions, hands-on
              courses, and guided projects that teach you how to design, build,
              and deploy real-world robotic systems.
            </motion.p>

            {/* CTA and Students */}
            <motion.div
              className="flex items-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Book Slot Button */}
              <button className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-3 sm:px-8 sm:py-3.5 rounded-lg flex items-center gap-3 transition-all duration-200 hover:scale-105 shadow-lg shadow-[#CCFF00]/30">
                <span className="text-sm sm:text-base tracking-wide">
                  Book Slot
                </span>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
              </button>

              {/* Student Avatars */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex -space-x-2 sm:-space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-orange-400 to-orange-600 border-2 border-black flex items-center justify-center">
                    <Image
                      src="/Image /image 116.svg"
                      alt="Student"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 border-2 border-black flex items-center justify-center">
                    <Image
                      src="/Image /image 117.svg"
                      alt="Student"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-purple-400 to-purple-600 border-2 border-black flex items-center justify-center">
                    <Image
                      src="/Image /image 119.svg"
                      alt="Student"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <span className="text-white text-xs sm:text-sm font-medium">
                  + 53 Students
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
