import TeamSection from "@/components/homepage/TeamSection";
import Navbar from "@/components/Navbar";
import { supabaseServer } from "@/lib/supabase/server";
import type { WorkshopPageContent } from "@/lib/schemas/home";
import { defaultGenericContent } from "@/lib/schemas/home";

type Cohort = NonNullable<WorkshopPageContent>["cohorts"][number];

function CohortCard({ c }: { c: Cohort }) {
  return (
    <section className="mt-16">
      {/* Single container with border, image on top, content below */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#0b0b0b]">
        {/* Top image */}
        <div className="relative">
          {c.img ? (
            <img src={c.img} alt={c.title} className="w-full h-auto block" />
          ) : (
            <div className="w-full aspect-video bg-gray-700 flex items-center justify-center text-gray-400">Program Image</div>
          )}
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
                  {[0,1,2].map((k) => (
                    c.avatars?.[k] ? (
                      <img key={k} src={c.avatars[k]} alt={`p${k+1}`} className="w-10 h-10 rounded-full border-2 border-black object-cover" />
                    ) : (
                      <div key={k} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-black" />
                    )
                  ))}
                </div>
                <span className="bg-[#C6FF00] text-black text-xs font-semibold px-3 py-1 rounded-md">
                  + {typeof c.participantsCount === 'number' ? c.participantsCount : 70} Students
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <div className="text-gray-400 text-sm mb-2">Registration Fee</div>
              <div className="text-2xl md:text-3xl font-bold">{c.fee}</div>
            </div>
          </div>

          <div className="mt-10">
            {c.ctaEnabled ? (
              <a href={c.ctaUrl || '#'} className="block w-full">
                <button className="w-full bg-[#C6FF00] hover:bg-[#b8e600] text-black font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl shadow-lg shadow-[#C6FF00]/20">
                  Register Now
                </button>
              </a>
            ) : (
              <button className="w-full bg-gray-600 text-gray-300 font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl cursor-not-allowed" disabled>
                Register Disabled
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Workshop() {
  const supabase = await supabaseServer();
  const { data: page } = await supabase
    .from("pages")
    .select("content_json")
    .eq("slug", "workshop")
    .maybeSingle();

  const fallback = defaultGenericContent.workshopPage;
  const content = (page?.content_json as any)?.workshopPage ?? fallback;

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-12 mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-white font-bold tracking-wide"
            style={{ fontSize: "44px", letterSpacing: "0.04em" }}
          >
            {content?.title || 'WORKSHOP'}
          </h1>
          {content?.subtitle && (
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mt-4">
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="max-w-5xl mx-auto mt-10">
          {(content?.cohorts ?? []).map((c) => (
            <CohortCard key={c.id} c={c} />
          ))}
        </div>
      </div>
      <TeamSection />
    </>
  );
}
