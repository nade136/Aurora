"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/auth") || pathname?.startsWith("/admin");
  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
