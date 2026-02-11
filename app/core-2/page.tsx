"use client";

import { useEffect } from "react";

const TARGET =
  "https://bakel-bakel.github.io/aurora-robotics-core-2.0-website/";

export default function Core2RedirectPage() {
  useEffect(() => {
    // Use replace to avoid leaving this page in history
    window.location.replace(TARGET);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold mb-3">Redirecting…</h1>
        <p className="text-gray-400 mb-4">
          If you are not redirected automatically, click the link below.
        </p>
        <a
          href={TARGET}
          className="text-[#C6FF00] underline underline-offset-4"
        >
          Go to Aurora Robotics Core 2.0 website
        </a>
      </div>
    </div>
  );
}
