"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { type WhatWeDoBlock } from "@/lib/schemas/home";

const services = [
  {
    title: "Education",
    description:
      "Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.",
    buttonText: "Register Now",
    buttonColor: "#CCFF00",
  },
  {
    title: "Hardware",
    description:
      "Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.",
    buttonText: "Schedule A Meeting",
    buttonColor: "#CCFF00",
  },
  {
    title: "Robotics Software",
    description:
      "Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.",
    buttonText: "Register Now",
    buttonColor: "#CCFF00",
  },
  {
    title: "Consultation",
    description:
      "Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.",
    buttonText: "Schedule A Meeting",
    buttonColor: "#CCFF00",
  },
  {
    title: "Firmware",
    description:
      "Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.",
    buttonText: "Register Now",
    buttonColor: "#CCFF00",
  },
];

type Props = { whatWeDo?: WhatWeDoBlock };

export default function WhatWeDo({ whatWeDo }: Props) {
  const items =
    whatWeDo?.items && whatWeDo.items.length > 0
      ? whatWeDo.items
      : services.map((s) => ({
          title: s.title,
          text: s.description,
          cta: { label: s.buttonText, url: "#" },
        }));
  return (
    <section className="relative bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Left Side - Header */}
          <div className="lg:col-span-4">
            {/* Services Badge */}
            <motion.div
              className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 border border-[#CCFF00] rounded-full mb-4 sm:mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#CCFF00] text-xs sm:text-sm font-medium tracking-wider">
                SERVICES
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                {whatWeDo?.title || "WHAT WE DO"}
              </h2>
              {(whatWeDo?.subtitle ||
                "At Aurora, we speak one language - Engineering") && (
                <p className="text-gray-400 text-sm sm:text-base ">
                  {whatWeDo?.subtitle ||
                    "At Aurora, we speak one language - Engineering"}
                </p>
              )}
            </motion.div>
          </div>

          {/* Right Side - First Two Cards */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {items.slice(0, 2).map((service, index) => (
                <motion.div
                  key={(service as any).title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* SVG Border with diagonal cut at bottom-right */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="none"
                    viewBox="0 0 400 300"
                  >
                    <path
                      d="M 2,2 L 398,2 L 398,260 L 360,298 L 2,298 Z"
                      fill="none"
                      stroke="rgb(39, 39, 42)"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Card Content */}
                  <div className="relative p-6 sm:p-8 flex flex-col h-full min-h-[240px] sm:min-h-[280px]">
                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 hover-react">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 sm:mb-8 grow hover-react group-hover:text-white">
                      {
                        ("description" in service
                          ? (service as any).description
                          : service.text) as string
                      }
                    </p>

                    {/* Button */}
                    <a
                      href={(service as any).cta?.url || "#"}
                      className="flex items-center gap-2 text-[#CCFF00] font-semibold text-sm hover:gap-3 transition-all duration-200 group-hover:translate-x-1"
                    >
                      <span>
                        {(service as any).cta?.label ||
                          (service as any).buttonText}
                      </span>
                      <div className="w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-black" />
                      </div>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.slice(2, 5).map((service, index) => (
            <motion.div
              key={(service as any).title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
              className="relative group"
            >
              {/* SVG Border with diagonal cut at bottom-right */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 400 300"
              >
                <path
                  d="M 2,2 L 398,2 L 398,260 L 360,298 L 2,298 Z"
                  fill="none"
                  stroke="rgb(39, 39, 42)"
                  strokeWidth="2"
                />
              </svg>

              {/* Card Content */}
              <div className="relative p-8 flex flex-col h-full min-h-[280px]">
                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 hover-react">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-6 sm:mb-8 grow hover-react group-hover:text-white">
                  {
                    ("description" in service
                      ? (service as any).description
                      : service.text) as string
                  }
                </p>

                {/* Button */}
                <a
                  href={(service as any).cta?.url || "#"}
                  className="flex items-center gap-2 text-[#CCFF00] font-semibold text-sm hover:gap-3 transition-all duration-200 group-hover:translate-x-1"
                >
                  <span>
                    {(service as any).cta?.label || (service as any).buttonText}
                  </span>
                  <div className="w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-black" />
                  </div>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
