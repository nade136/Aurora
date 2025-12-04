import { Play } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { mediaPublicUrl } from "@/utils/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type Size = "normal" | "tall";
export type MediaType = "image" | "video";
export type TestimonialItem = {
  name: string;
  size: Size;
  mediaType: MediaType;
  mediaUrl: string;
  avatarUrl: string;
};

const toUrl = (p?: string | null) => {
  if (!p) return "";
  if (p.startsWith("http") || p.startsWith("/")) return p;
  return mediaPublicUrl(p) || "";
};

async function loadPublished(): Promise<TestimonialItem[]> {
  const supabase = await supabaseServer();
  const { data: snap } = await supabase
    .from("published_snapshots")
    .select("data")
    .eq("slug", "testimonials")
    .maybeSingle();
  const sections = (snap as any)?.data?.sections as Array<{ key: string; order?: number; blocks: any[] }> | undefined;
  const grid = sections?.find((s) => s.key === "testimonials_grid");
  const blocks = grid?.blocks || [];
  return blocks
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .map((b: any) => {
      const d = b.data || {};
      return {
        name: d.name || "",
        size: (d.size as Size) || "normal",
        mediaType: (d.mediaType as MediaType) || (d.media?.type as MediaType) || "image",
        mediaUrl: toUrl(d.mediaUrl || d.media?.url),
        avatarUrl: toUrl(d.avatarUrl || d.avatar),
      } as TestimonialItem;
    });
}

export default async function TestimonialsSectionServer() {
  const items = await loadPublished();

  return (
    <section className="bg-black py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
          HEAR WHAT THEY HAVE TO SAY
          <br />
          ABOUT COHORT 1
        </h2>

        {/* Video Grid - Full Width */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-end auto-rows-min">
            {items.map((testimonial, idx) => (
              <div key={idx} className="relative group cursor-pointer">
                {/* Video Thumbnail */}
                <div
                  className={`relative bg-zinc-900 overflow-hidden ${
                    testimonial.size === "tall" ? "aspect-3/6" : "aspect-3/5"
                  }`}
                >
                  {testimonial.mediaType === "video" ? (
                    <video
                      src={testimonial.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.mediaUrl}
                      alt={testimonial.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {testimonial.mediaType === "video" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Name Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shrink-0">
                    {testimonial.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span className="text-[10px] text-gray-400">Photo</span>
                      </div>
                    )}
                  </div>
                  <span className="text-white text-xs font-medium truncate">
                    {testimonial.name}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 text-sm py-8">No published testimonials yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
