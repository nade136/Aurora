import React from "react";

export default function StatsSection() {
  return (
    <section className="px-6 py-20 bg-black">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block px-4 py-2 rounded-md bg-[#2D3B00] text-[#CCFF00] text-xs font-semibold tracking-wider">
            STATISTICS
          </span>
          <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.95]">
            WE HAVE THE
            <br />
            NUMBERS
          </h2>
        </div>

        <div className="lg:col-span-2">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center min-w-[160px]">
              <div className="text-white text-5xl md:text-6xl font-bold">12</div>
              <div className="text-gray-400 text-sm md:text-base mt-2">Universities Reached</div>
            </div>

            <div className="hidden md:block h-10 w-px bg-white/20" />

            <div className="flex flex-col items-center text-center min-w-[160px]">
              <div className="text-white text-5xl md:text-6xl font-bold">50+</div>
              <div className="text-gray-400 text-sm md:text-base mt-2">Cohort 1 Students</div>
            </div>

            <div className="hidden md:block h-10 w-px bg-white/20" />

            <div className="flex flex-col items-center text-center min-w-[160px]">
              <div className="text-white text-5xl md:text-6xl font-bold">15</div>
              <div className="text-gray-400 text-sm md:text-base mt-2">Projects Delivered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
