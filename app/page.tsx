import Navbar from "@/components/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import PartneredBy from "@/components/homepage/PartneredBy";
import WhatWeDo from "@/components/homepage/WhatWeDo";
import RoboticsWorkshop from "@/components/homepage/RoboticsWorkshop";
import TeamSection from "@/components/homepage/TeamSection";
import FAQSection from "@/components/homepage/FAQSection";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection />
      <PartneredBy />
      <WhatWeDo />
      <RoboticsWorkshop />
      <TeamSection />
      <FAQSection />
    </div>
  );
}
