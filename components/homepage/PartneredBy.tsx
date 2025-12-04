"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function PartneredBy() {
  return (
    <section className="relative bg-black py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-wrap items-center gap-4 sm:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white">PARTNERED BY</h2>

          {/* Divider */}
          <div className="hidden sm:block w-px h-12 bg-white/20" />

          {/* Partner Logos */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Regalia Logo */}
            <Image 
              src="/Image /Regalia.svg" 
              alt="Regalia" 
              width={120} 
              height={40}
              className="h-8 sm:h-10 w-auto"
            />
            
            {/* Second Partner Logo */}
            <Image 
              src="/Image /ChatGPT Image Aug 12, 2025, 02_50_20 PM 1.svg" 
              alt="Partner Logo" 
              width={48} 
              height={48}
              className="h-10 sm:h-12 w-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
