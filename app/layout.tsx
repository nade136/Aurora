import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppFrame from "@/components/AppFrame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurora - Accelerate Your Robotics Career",
  description: "Join Aurora's cutting-edge robotics program and accelerate your career in robotics technology. Expert-led courses and hands-on training.",
  keywords: ["robotics", "career", "education", "technology", "training", "courses"],
  authors: [{ name: "Aurora Technologies" }],
  icons: {
    icon: "/Image%20/Vector%204.svg",
    apple: "/Image%20/Vector%204.svg",
    shortcut: "/Image%20/Vector%204.svg",
  },
  openGraph: {
    title: "Aurora - Accelerate Your Robotics Career",
    description: "Join Aurora's cutting-edge robotics program and accelerate your career in robotics technology.",
    type: "website",
    images: [
      {
        url: "/Image%20/Vector%204.svg",
        alt: "Aurora logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: [
      {
        url: "/Image%20/Vector%204.svg",
        alt: "Aurora logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 min-h-screen`}
      >
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
