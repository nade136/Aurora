import Navbar from "@/components/Navbar";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";
import ConfettiOnce from "@/components/ConfettiOnce";

const GOLD = "#D4AF37";

function PortraitCard({ src }: { src: string }) {
  return (
    <div className="inline-block rounded-2xl p-1" style={{ boxShadow: `0 0 0 2px ${GOLD}` }}>
      <div className="rounded-xl p-1 bg-[#0f0f0f]" style={{ boxShadow: "inset 0 0 0 2px white" }}>
        <div className="w-[360px] h-[420px] rounded-lg overflow-hidden bg-[#111]">
          <Image src={src} alt="Portrait" width={360} height={420} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

// (Animations CSS will be injected via a plain <style> tag inside the component return)

const mediaUrl = (path?: string | null) =>
  path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}` : undefined;

async function getLiveAwards() {
  const supabase = await supabaseServer();
  // find page id by slug
  const { data: pages } = await supabase.from("pages").select("id").eq("slug", "rewards").limit(1);
  const pageId = pages?.[0]?.id as string | undefined;
  if (!pageId) return [] as Array<{ key: string; title: string; quote?: string; icon?: string; name: string; portrait?: string; description?: string }>;

  // find section id for 'awards'
  const { data: sections } = await supabase.from("sections").select("id").eq("page_id", pageId).eq("key", "awards").limit(1);
  const sectionId = sections?.[0]?.id as string | undefined;
  if (!sectionId) return [] as Array<{ key: string; title: string; quote?: string; icon?: string; name: string; portrait?: string; description?: string }>;

  // fetch blocks
  const { data: blks } = await supabase
    .from("blocks")
    .select("type, data, order")
    .eq("section_id", sectionId)
    .eq("type", "award_winner")
    .order("order", { ascending: true });

  type BlockRow = {
    type: string;
    order: number;
    data: {
      key?: string;
      title?: string;
      quote?: string;
      icon?: string;
      name?: string;
      portrait?: string;
      description?: string;
    };
  };

  const awards = (blks || []).map((b: BlockRow) => {
    const iconVal = b.data?.icon as string | undefined;
    const portraitVal = b.data?.portrait as string | undefined;
    const resolve = (p?: string) => (!p ? undefined : p.startsWith("/") ? p : mediaUrl(p));
    return {
      key: b.data?.key || "custom",
      title: b.data?.title || "",
      quote: b.data?.quote || undefined,
      icon: resolve(iconVal),
      name: b.data?.name || "",
      portrait: resolve(portraitVal),
      description: b.data?.description || "",
    };
  });
  return awards as Array<{ key: string; title: string; quote?: string; icon?: string; name: string; portrait?: string; description?: string }>;
}

export default async function Rewards() {
  const dataAwards = await getLiveAwards();
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* one-time confetti on load (client component) */}
      <ConfettiOnce duration={1000} />

      {/* Animations CSS (plain style, not styled-jsx) */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { 0% { transform: scale(0.94); opacity: 0; } 60% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(1.0); } }
        @keyframes glowPulse { 0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.55), 0 0 32px rgba(212,175,55,0.25); } 60% { box-shadow: 0 0 0 8px rgba(212,175,55,0.0), 0 0 18px rgba(212,175,55,0.45); } 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.0), 0 0 0 rgba(212,175,55,0.0); } }
        .animate-fadeUp { animation: fadeUp 700ms ease-out both; }
        .trophy-reveal { display: inline-block; border-radius: 12px; animation: glowPulse 1400ms ease-out 120ms both; }
        .trophy-reveal img { animation: scaleIn 900ms cubic-bezier(0.22, 1, 0.36, 1) 40ms both; }
        @media (prefers-reduced-motion: reduce) { .animate-fadeUp, .trophy-reveal, .trophy-reveal img { animation: none !important; } }
      `}</style>

      <section className="pt-32 pb-10 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <h1 className="text-white font-bold tracking-wide" style={{ fontSize: "44px", letterSpacing: "0.06em" }}>
            MEET THE BEST OF THE BEST
          </h1>
          <p className="text-gray-300 text-base leading-relaxed mt-6">
            Every Aurora member walks a path through struggle, discovery, creativity, curiosity, and ultimately, mastery.
            These five awards represent that journey. They are not merely medals, they are milestones of becoming.
          </p>
          <div className="mt-12 flex justify-center">
            <div className="w-[140px] h-[160px] rounded-md bg-linear-to-b from-zinc-600 to-zinc-900" />
          </div>
        </div>
      </section>

      <div className="px-6">
        <div className="max-w-[1000px] mx-auto">
          {dataAwards.map((a, idx) => (
            <section
              key={`${a.key}-${idx}`}
              className="py-16 text-center animate-fadeUp"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              {/* Top thin line */}
              <div className="flex justify-center">
                <div className="h-[2px] w-24 bg-white/30" />
              </div>
              {/* Large award icon */}
              {a.icon && (
                <div className="mt-6 flex justify-center">
                  {/* Trophy reveal + glow for first award */}
                  <div className={idx === 0 ? "trophy-reveal" : undefined}>
                  <Image
                    src={a.icon}
                    alt={a.title}
                    width={520}
                    height={520}
                    className="w-[300px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-auto mx-auto block"
                  />
                  </div>
                </div>
              )}
              {a.quote && (
                <p className="text-gray-400 text-sm italic max-w-xl mx-auto mt-6">“{a.quote}”</p>
              )}
              <div className="mt-6 flex justify-center">
                <div className="h-[3px] w-24 rounded-full" style={{ backgroundColor: GOLD }} />
              </div>
              <h2 className="mt-4 font-extrabold uppercase" style={{ color: GOLD, letterSpacing: "0.06em", fontSize: "28px" }}>
                {a.title}
              </h2>

              <div className="mt-8 flex items-end justify-center gap-6">
                <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: GOLD + "33" }}>
                  <span className="text-black" style={{ color: GOLD }}>‹</span>
                </button>
                {a.portrait && <PortraitCard src={a.portrait} />}
                <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: GOLD + "33" }}>
                  <span className="text-black" style={{ color: GOLD }}>›</span>
                </button>
              </div>

              <div className="mt-4 text-white font-semibold tracking-wide">{a.name}</div>

              <p className="mt-6 text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">
                {typeof a.description === "string" ? a.description : a.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
