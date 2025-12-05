"use client";

import { Linkedin, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <footer className="text-white" style={{ backgroundColor: '#151514' }}>
      {/* CTA Section - Run Into The Unknown */}
      <div className="border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-16 py-24">
          <div className="text-center max-w-2xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              RUN INTO THE UNKNOWN
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat!
            </p>
            <div className="flex justify-center">
              <button className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-8 py-3.5 rounded-lg flex items-center gap-3 transition-all duration-200 hover:scale-105 shadow-lg shadow-[#CCFF00]/30">
                <span className="text-base tracking-wide">Get Started</span>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-[1200px] mx-auto px-16 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Logo and Social Section */}
          <div className="space-y-6">
            {/* Aurora Logo */}
            <div className="flex items-center gap-0">
              <Image
                src="/Image%20/Vector%204.svg"
                alt="Aurora logo"
                width={56}
                height={56}
                priority
              />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-[#CCFF00] mb-3">AURORA</h2>
            </div>

            {/* Description Text */}
            <p className="text-gray-400 text-base leading-relaxed max-w-[280px]">
              Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/5 hover:bg-[#CCFF00] rounded-md flex items-center justify-center transition-all duration-300 group border border-white/10"
              >
                <Linkedin className="w-5 h-5 text-white group-hover:text-black transition-colors" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/5 hover:bg-[#CCFF00] rounded-md flex items-center justify-center transition-all duration-300 group border border-white/10"
              >
                <svg className="w-5 h-5 text-white group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/services/trainings"
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors duration-200 text-base"
                >
                  Trainings
                </Link>
              </li>
              <li>
                <Link
                  href="/services/robotic-engineering"
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors duration-200 text-base"
                >
                  Robotic Engineering
                </Link>
              </li>
              <li>
                <Link
                  href="/services/firmware"
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors duration-200 text-base"
                >
                  Firmware
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Newsletter</h3>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Get tips, updates, and insights about the robotics and engineering industries
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  required
                  className="w-full bg-white text-black placeholder:text-gray-500 pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCFF00] transition-all text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-3.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-[#CCFF00]/20 text-base"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/5 pt-8">
          <p className="text-center text-gray-500 text-sm">
            Copyright © 2025 Aurora | All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
