import TeamSection from "@/components/homepage/TeamSection";
import Navbar from "@/components/Navbar";
import { div } from "framer-motion/client";
import Image from "next/image";

const cohorts = [
  {
    id: 1,
    badge: "ONGOING",
    img: "/services/learn1.svg",
    title: "Aurora Core Workshop (Cohort 1)",
    description:
      "ROS2, Linux, Lorem ipsum dolor sit amet. In dolorem dolore et maiores dolores ut consequuntur eligendi et placeat praesentium.",
    fee: "$32 USD / 50,000 NGN",
    date: "MARCH 2026 to APRIL 2026",
  },
  {
    id: 2,
    badge: "MARCH 2026 to APRIL 2026",
    img: "/services/learn1.svg",
    title: "Aurora Core Workshop (Cohort 2)",
    description:
      "ROS2, Linux, Lorem ipsum dolor sit amet. In dolorem dolore et maiores dolores ut consequuntur eligendi et placeat praesentium.",
    fee: "$32 USD / 50,000 NGN",
    date: "AUGUST 2026 to SEPTEMBER 2026",
  },
  {
    id: 3,
    badge: "OCTOBER 2026",
    img: "/services/learn1.svg",
    title: "Autonav Workshop (Cohort X)",
    description:
      "ROS2, Linux, Lorem ipsum dolor sit amet. In dolorem dolore et maiores dolores ut consequuntur eligendi et placeat praesentium.",
    fee: "$32 USD / 50,000 NGN",
    date: "",
  },
];

function CohortCard({ c }: { c: (typeof cohorts)[number] }) {
  return (
    <section className="mt-16">
      {/* Single container with border, image on top, content below */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#0b0b0b]">
        {/* Top image */}
        <div className="relative">
          <Image
            src={c.img}
            alt={c.title}
            width={1600}
            height={900}
            className="w-full h-auto block"
          />
          {/* Badge over image */}
          <div className="absolute top-6 right-6 bg-white text-black text-xs md:text-sm font-semibold px-4 py-2 rounded-xl shadow">
            {c.badge}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">{c.title}</h3>
          <p className="text-gray-300 max-w-2xl">{c.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div>
              <div className="text-gray-400 text-sm mb-3">Participants</div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <Image
                    src="/Image /image 116.svg"
                    alt="p1"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <Image
                    src="/Image /image 117.svg"
                    alt="p2"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-black"
                  />
                  <Image
                    src="/Image /image 119.svg"
                    alt="p3"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-black"
                  />
                </div>
                <span className="bg-[#C6FF00] text-black text-xs font-semibold px-3 py-1 rounded-md">
                  + 70 Students
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <div className="text-gray-400 text-sm mb-2">Registration Fee</div>
              <div className="text-2xl md:text-3xl font-bold">{c.fee}</div>
            </div>
          </div>

          <div className="mt-10">
            <button className="w-full bg-[#C6FF00] hover:bg-[#b8e600] text-black font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl shadow-lg shadow-[#C6FF00]/20">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-12 mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-white font-bold tracking-wide"
            style={{ fontSize: "44px", letterSpacing: "0.04em" }}
          >
            LEARN. BUILD. COMPETE.
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mt-4">
            Hands-on robotics courses that turn curiosity into creativity.
            Explore coding, engineering, and teamwork through real-world
            projects and challenges—designed to spark innovation and confidence
            in every young maker.
          </p>
        </div>

        <div className="max-w-5xl mx-auto mt-10">
          {cohorts.map((c) => (
            <CohortCard key={c.id} c={c} />
          ))}
        </div>
      </div>
      {/* team section */}
      <TeamSection />
    </>
  );
}
