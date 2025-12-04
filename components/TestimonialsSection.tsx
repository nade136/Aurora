"use client";

import { Play } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "David Ayomide",
    image: "/Image /image 116.svg",
    size: "normal",
  },
  {
    id: 2,
    name: "David Ayomide",
    image: "/Image /image 117.svg",
    size: "tall",
  },
  {
    id: 3,
    name: "David Ayomide",
    image: "/Image /image 119.svg",
    size: "normal",
  },
  {
    id: 4,
    name: "David Ayomide",
    image: "/Image /image 116.svg",
    size: "normal",
  },
  {
    id: 5,
    name: "David Ayomide",
    image: "/Image /image 117.svg",
    size: "tall",
  },
  {
    id: 6,
    name: "David Ayomide",
    image: "/Image /image 119.svg",
    size: "normal",
  },
  {
    id: 7,
    name: "David Ayomide",
    image: "/Image /image 116.svg",
    size: "normal",
  },
  {
    id: 8,
    name: "David Ayomide",
    image: "/Image /image 117.svg",
    size: "tall",
  },
  {
    id: 9,
    name: "David Ayomide",
    image: "/Image /image 119.svg",
    size: "normal",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-black py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
          HEAR WHAT THEY HAVE TO SAY
          <br />
          ABOUT COHORT 1
        </h2>

        {/* Video Grid - Full Width */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-end auto-rows-min">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="relative group cursor-pointer"
              >
                {/* Video Thumbnail */}
                <div
                  className={`relative bg-zinc-900 overflow-hidden ${
                    testimonial.size === "tall" ? "aspect-3/6" : "aspect-3/5"
                  }`}
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Name Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white text-xs font-medium truncate">
                    {testimonial.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
