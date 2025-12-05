"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const baseLink =
    "text-sm font-medium transition-colors duration-200 hover:text-[#C6FF00]";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href;
  const linkClass = (href: string) =>
    `${baseLink} ${isActive(href) ? "!text-[#C6FF00]" : "text-white"}`;
  if (typeof window !== "undefined") {
    // debug current route once per render
    console.log("Navbar pathname:", pathname);
  }
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-[calc(100%-1rem)] sm:w-auto">
      <div className="px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 md:gap-16 md:min-w-[800px]">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <Image
                src="/Image%20/Vector%204.svg"
                alt="Aurora logo"
                width={48}
                height={48}
                priority
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-12">
            <Link href="/" className={linkClass("/")}>
              HOME
            </Link>
            <Link href="/services" className={linkClass("/services")}>
              WORKSHOP
            </Link>
            <Link href="/reviews" className={linkClass("/reviews")}>
              REVIEWS
            </Link>
            <Link href="/rewards" className={linkClass("/rewards")}>
              AWARDS
            </Link>
          </div>

          {/* Right side: CTA (desktop) + Hamburger (mobile) */}
          <div className="flex items-center">
            <Link href="/book-slot" className="hidden md:flex bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-2.5 rounded-lg items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-[#CCFF00]/20">
              <span className="text-sm tracking-wide">Book Slot</span>
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-[#CCFF00]" />
              </div>
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-white ml-2 active:scale-95 transition"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden px-4 pb-4">
          <div className="rounded-xl border border-white/10 bg-gray-900/70 backdrop-blur-md p-4">
            <nav className="flex flex-col">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md ${linkClass("/")} hover:bg-white/5`}
                onClick={() => setOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/services"
                className={`px-3 py-2 rounded-md ${linkClass("/services")} hover:bg-white/5`}
                onClick={() => setOpen(false)}
              >
                WORKSHOP
              </Link>
              <Link
                href="/reviews"
                className={`px-3 py-2 rounded-md ${linkClass("/reviews")} hover:bg-white/5`}
                onClick={() => setOpen(false)}
              >
                REVIEWS
              </Link>
              <Link
                href="/rewards"
                className={`px-3 py-2 rounded-md ${linkClass("/rewards")} hover:bg-white/5`}
                onClick={() => setOpen(false)}
              >
                AWARDS
              </Link>
              <div className="my-3 h-px bg-white/10" />
              <Link
                href="/book-slot"
                onClick={() => setOpen(false)}
                className="w-full justify-center bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold px-6 py-2.5 rounded-lg inline-flex items-center gap-2 transition-all duration-200 shadow-lg shadow-[#CCFF00]/20"
              >
                <span className="text-sm tracking-wide">Book Slot</span>
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-[#CCFF00]" />
                </div>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
