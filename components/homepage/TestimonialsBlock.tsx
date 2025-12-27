import { supabaseServer } from "@/lib/supabase/server";
import { HomeContent, defaultHomeContent } from "@/lib/schemas/home";
import { mediaPublicUrl } from "@/utils/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadHomeContent(): Promise<HomeContent> {
  const supabase = await supabaseServer();
  const { data: page } = await supabase
    .from("pages")
    .select("content_json")
    .eq("slug", "home")
    .maybeSingle();
  const content = (page?.content_json as HomeContent | undefined) ?? defaultHomeContent;
  return content;
}

export default async function TestimonialsBlock() {
  const content = await loadHomeContent();
  const t = content.testimonials;
  if (!t) return null;

  const toUrl = (p?: string | null) => {
    if (!p) return "";
    if (p.startsWith("http") || p.startsWith("/")) return p;
    return mediaPublicUrl(p) || "";
  };

  const items = (t.items || []).map((it) => ({
    ...it,
    avatar: toUrl(it.avatar),
  }));
  const featuredIndex = t.featuredIndex ?? 0;
  const featured = items[featuredIndex];

  return (
    <section className="bg-black px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left: Header + compact list */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-[10px] tracking-wide bg-lime-300/10 text-lime-300 border border-lime-300/30">
              {(t.badgeLabel || "TESTIMONIALS")}
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">{t.title || "Section title"}</h3>
              {t.subtitle && (
                <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
              )}
            </div>
            {t.seeMore?.label && t.seeMore?.url && (
              <a href={t.seeMore.url} className="text-sm text-lime-300 hover:underline inline-flex items-center gap-1">
                {t.seeMore.label}
                <span className="inline-block h-1 w-1 rounded-full bg-lime-300" />
              </a>
            )}
            <div className="space-y-2">
              {items.slice(0, 2).map((it, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-white/10 rounded-full px-3 py-2">
                  {it?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.avatar} alt={it?.name || "Avatar"} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-700" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate text-white">{it?.name || "Name"}</div>
                    <div className="text-[10px] text-gray-400 truncate">{it?.role || ""}</div>
                  </div>
                  <span className="ml-auto h-2 w-2 rounded-full bg-lime-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Middle: Quote card */}
          <div className="bg-gray-800/60 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <div className="text-5xl text-gray-500 leading-none">“</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.leadQuote || "A compelling quote to highlight in the center of the section."}
            </p>
            {featured && (
              <div className="mt-4 flex items-center gap-2">
                {featured.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.avatar} alt={featured.name || "Avatar"} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-700" />
                )}
                <div className="text-xs">
                  <div className="font-medium text-white">{featured.name}</div>
                  <div className="text-gray-400">{featured.role}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Featured media */}
          <div className="bg-gray-800/60 border border-white/10 rounded-xl p-4">
            {featured && (
              <div className="mb-3 flex items-center gap-2">
                {featured.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.avatar} alt={featured.name || "Avatar"} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-700" />
                )}
                <div className="text-xs">
                  <div className="font-medium truncate max-w-[10rem] text-white">{featured.name || "Name"}</div>
                  <div className="text-gray-400 truncate max-w-[10rem]">{featured.role || ""}</div>
                </div>
              </div>
            )}

            <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
              {toUrl(t.heroVideo) ? (
                <>
                  <video
                    src={toUrl(t.heroVideo)}
                    className="w-full h-full object-cover"
                    poster={toUrl(t.heroPoster) || undefined}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 border border-white/40 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </>
              ) : toUrl(t.heroImage) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toUrl(t.heroImage)} alt="Featured" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No media selected</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
