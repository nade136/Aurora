import Navbar from "@/components/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import PartneredBy from "@/components/homepage/PartneredBy";
import WhatWeDo from "@/components/homepage/WhatWeDo";
import RoboticsWorkshop from "@/components/homepage/RoboticsWorkshop";
import TeamSection from "@/components/homepage/TeamSection";
import FAQSection from "@/components/homepage/FAQSection";
import { supabaseServer } from "@/lib/supabase/server";
import { defaultHomeContent, type HomeContent } from "@/lib/schemas/home";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: page } = await supabase
    .from("pages")
    .select("content_json")
    .eq("slug", "home")
    .maybeSingle();
  const content: HomeContent = (page?.content_json as HomeContent | undefined) ?? defaultHomeContent;

  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection />
      <WhatWeDo whatWeDo={content.whatWeDo} />
      <PartneredBy />
      <RoboticsWorkshop workshop={content.workshop} testimonials={content.testimonials} />
      <TeamSection />
      <FAQSection />
    </div>
  );
}
