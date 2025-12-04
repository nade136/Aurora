export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/Navbar";
import { Linkedin } from "lucide-react";
import Image from "next/image";
import TestimonialsSectionServer from "@/components/TestimonialsSectionServer";
// import LearningSection from "@/components/LearningSection";
import StatsSection from "@/components/StatsSection";
import FAQSection from "@/components/homepage/FAQSection";
import { supabaseServer } from "@/lib/supabase/server";

type SocialPlatform = 'x' | 'linkedin' | 'instagram' | 'facebook' | 'whatsapp';
type Review = { 
  id: string; 
  icon?: string; 
  text: string; 
  author: string; 
  subtitle?: string; 
  avatar?: string; 
  size?: "large" | "normal"; 
  social?: { 
    platform?: SocialPlatform; 
    url?: string;
    // For backward compatibility
    x?: string;
    linkedin?: string;
  } 
};

const mediaUrl = (path?: string | null) => (path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}` : undefined);

async function getReviews(): Promise<Review[]> {
  const supabase = await supabaseServer();
  // Read from published snapshot like Rewards
  const { data: snap } = await supabase
    .from("published_snapshots")
    .select("data")
    .eq("slug", "reviews")
    .maybeSingle();
  const sections = (snap as any)?.data?.sections as Array<{ key: string; blocks: any[] }> | undefined;
  const grid = sections?.find((s) => s.key === "reviews_grid");
  const blocks = grid?.blocks || [];
  const resolve = (p?: string) => (!p ? undefined : p.startsWith("/") ? p : mediaUrl(p));
  return blocks
    .filter((b) => b.type === "reviews_card")
    .map((b, i) => ({
      id: String(i),
      icon: b.data?.icon,
      text: b.data?.text || "",
      author: b.data?.author || "",
      subtitle: b.data?.subtitle || "",
      avatar: resolve(b.data?.avatar),
      size: (b.data?.size as any) || "large",
      social: b.data?.social,
    }));
}

export default async function Reviews() {
  const dbList = await getReviews();
  // Only use reviews from the database, no default reviews
  const list = dbList;
  const getIcon = (iconType: string, social?: { platform?: SocialPlatform; url?: string; x?: string; linkedin?: string }) => {
    // If new social link structure exists, use that
    if (social?.platform && social.url) {
      const platform = social.platform;
      const url = social.url.startsWith('http') ? social.url : 
                 platform === 'whatsapp' ? `https://wa.me/${social.url.replace(/[^0-9+]/g, '')}` : 
                 `https://${platform}.com/${social.url}`;
      
      const icon = (() => {
        switch (platform) {
          case 'x':
            return (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            );
          case 'linkedin':
            return <Linkedin className="w-5 h-5" />;
          case 'instagram':
            return (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            );
          case 'facebook':
            return (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            );
          case 'whatsapp':
            return (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.795-1.48-1.77-1.653-2.07-.174-.298-.018-.458.13-.606.136-.133.296-.347.445-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.508-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.47h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            );
          default:
            return <Linkedin className="w-5 h-5" />;
        }
      })();

      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:opacity-80 transition-opacity"
          aria-label={`View on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        >
          {icon}
        </a>
      );
    }
    
    // For backward compatibility (old social links)
    if (social?.x) {
      return (
        <a href={social.x} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="View on X">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      );
    }
    if (social?.linkedin) {
      return (
        <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="View on LinkedIn">
          <Linkedin className="w-5 h-5" />
        </a>
      );
    }

    // Fallback to icon type if no social links
    switch (iconType) {
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "x":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      default:
        return <Linkedin className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              PROOF THAT WE DELIVER
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              From September to November 2025, we made impact in Africa with our
              first-ever workshops and live reviews and comments say it all.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {list.map((review) => (
              <div
                key={review.id}
                className={`relative flex flex-col bg-[#151515] rounded-2xl border-2 border-[#2b2b2b] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] hover:border-[#CCFF00]/30 transition-all duration-300 h-[360px] md:h-[400px] ${
                  review.size === "large" ? "lg:row-span-1" : "lg:row-span-1"
                }`}
              >
                {/* Social Icon */}
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1D1D1D] flex items-center justify-center border border-white/10 hover:border-[#CCFF00]/30 transition-all duration-300">
                    <div className="scale-90">
                      {getIcon(review.icon || "linkedin", review.social)}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {review.text}
                </p>

                {/* Author */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 bg-[#141414] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden">
                    {review.avatar && (
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-base tracking-tight">
                        {review.author}
                      </span>
                      <span className="text-gray-400 text-xs">{review.subtitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSectionServer />

      {/* Learning Section */}
      {/* <LearningSection /> */}
      {/* Statistics Section */}
      <StatsSection />

      {/* FAQ */}
      <FAQSection />
    </div>
  );
}
