"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const teamMembers = [
  {
    name: "Bakel Bakel",
    role: "Founder, Lead Tutor",
    image: "/Image%20/Image_fx%20(10)%201.svg",
    isHighlighted: false,
  },
  {
    name: "Bakel Bakel",
    role: "Founder, Lead Tutor",
    image: "/Image%20/Image_fx%20(10)%201.svg",
    isHighlighted: false,
  },
  {
    name: "Bakel Bakel",
    role: "Founder, Lead Tutor",
    image: "/Image%20/Image_fx%20(10)%201.svg",
    isHighlighted: true,
  },
];

export default function TeamSection() {
  return (
    <section className="relative bg-[#000000] py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          {/* Badge */}
          <div className="inline-block px-4 py-1 bg-orange-100 rounded-full mb-4">
            <span className="text-orange-500 text-xs font-medium uppercase tracking-wider">
              The Team
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#ccff02] mb-4">
            Team Aurora
          </h2>
          <p className="text-gray-500 text-base sm:text-lg">
            Meet the Team behind the vision at Aurora
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              {/* Image */}
              <div className="relative aspect-3/4 bg-gray-200 rounded-2xl overflow-hidden mb-4">
                <Image
                  src={member.image}
                  alt={`${member.name} photo`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/10" />
              </div>

              {/* Info */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-3">
                  {member.role}
                </p>

                {/* LinkedIn Badge - only on highlighted member */}
                {/* {member.isHighlighted && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-white text-xs font-semibold">LINK</span>
                  </div>
                )} */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
