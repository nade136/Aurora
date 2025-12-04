"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { mediaPublicUrl } from "@/utils/media";

// DB block type shape used elsewhere in the app
type Block<T> = { id: string; order: number; type: string; data: T };

export default function TestimonialsAdminPage() {
  // UI-only local state copy so clicking a card can edit its content
  type Size = "normal" | "tall";
  type MediaType = "image" | "video";
  type Item = {
    id: string;
    name: string;
    size: Size;
    mediaType: MediaType;
    mediaUrl: string; // main big media
    avatarUrl: string; // small circle image
  };

  const supabase = useMemo(() => supabaseBrowser(), []);

  const [items, setItems] = useState<Item[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    size: Size;
    mediaType: MediaType;
    mediaUrl: string;
    avatarUrl: string;
  } | null>(null);

  const [pageId, setPageId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const getDisplayUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return mediaPublicUrl(path) || path;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Ensure testimonials page
      const { data: p, error: pErr } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "testimonials")
        .maybeSingle();
      let pid = p?.id as string | undefined;
      if (!pid) {
        const { data: p2, error: pErr2 } = await supabase
          .from("pages")
          .insert({ slug: "testimonials", title: "Testimonials", status: "draft" })
          .select("id")
          .single();
        if (pErr2) { console.error(pErr2); setLoading(false); return; }
        pid = p2?.id as string;
      }
      setPageId(pid!);

      // Ensure section for grid
      const { data: s1 } = await supabase
        .from("sections")
        .select("id")
        .eq("page_id", pid)
        .eq("key", "testimonials_grid")
        .maybeSingle();
      let sid = s1?.id as string | undefined;
      if (!sid) {
        const { data: s2, error: sErr } = await supabase
          .from("sections")
          .insert({ page_id: pid, key: "testimonials_grid", order: 0 })
          .select("id")
          .single();
        if (sErr) { console.error(sErr); setLoading(false); return; }
        sid = s2?.id as string;
      }
      setSectionId(sid!);

      // Load blocks
      const { data: blks, error: bErr } = await supabase
        .from("blocks")
        .select("id, order, type, data")
        .eq("section_id", sid)
        .order("order");
      if (bErr) { console.error(bErr); setLoading(false); return; }

      const mapped: Item[] = (blks as Block<any>[] | null || []).map((b) => ({
        id: b.id,
        name: b.data?.name || "",
        size: (b.data?.size as Size) || "normal",
        mediaType: (b.data?.mediaType as MediaType) || (b.data?.media?.type as MediaType) || "image",
        mediaUrl: b.data?.mediaUrl || b.data?.media?.url || "",
        avatarUrl: b.data?.avatarUrl || b.data?.avatar || "",
      }));

      if (mapped.length === 0) {
        // Try to seed from existing media in storage so UI isn't empty
        const { data: mediaItems, error: mErr } = await supabase.storage
          .from("media")
          .list(undefined, { limit: 50, sortBy: { column: "created_at", order: "desc" } });
        if (mErr) console.error(mErr);
        const names = (mediaItems || []).map((x) => x.name).slice(0, 9);
        const seeds: Item[] = Array.from({ length: Math.max(9, names.length || 9) }).map((_, i) => ({
          id: `seed-${i + 1}`,
          name: "New Testimonial",
          size: (i % 3 === 1 ? "tall" : "normal") as Size,
          mediaType: "image",
          mediaUrl: names[i] || "",
          avatarUrl: names[i] || "",
        }));
        setItems(seeds.slice(0, 9));
      } else {
        // If we have some blocks, pad with placeholders so UI shows a full grid
        let list = [...mapped];
        if (list.length < 9) {
          const need = 9 - list.length;
          const start = list.length;
          const pads: Item[] = Array.from({ length: need }).map((_, i) => ({
            id: `seed-${start + i + 1}`,
            name: "New Testimonial",
            size: ((start + i) % 3 === 1 ? "tall" : "normal") as Size,
            mediaType: "image",
            mediaUrl: "",
            avatarUrl: "",
          }));
          list = [...list, ...pads];
        }
        setItems(list);
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const openModal = (id: string) => {
    const t = items.find((x) => x.id === id);
    if (!t) return;
    setDraft({
      name: t.name,
      size: t.size,
      mediaType: t.mediaType,
      mediaUrl: t.mediaUrl,
      avatarUrl: t.avatarUrl,
    });
    setOpenId(id);
  };

  const closeModal = () => {
    setOpenId(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (!draft || openId == null) return;
    const isSeed = openId.startsWith("seed-");
    const payload = {
      name: draft.name,
      size: draft.size,
      mediaType: draft.mediaType,
      mediaUrl: draft.mediaUrl,
      avatarUrl: draft.avatarUrl,
    };
    const persist = async () => {
      if (isSeed) {
        if (!sectionId) return;
        const order = Math.max(
          -1,
          ...items
            .filter((x) => !x.id.startsWith("seed-"))
            .map(() => 0)
        ) + 1;
        const { data, error } = await supabase
          .from("blocks")
          .insert({ section_id: sectionId, type: "testimonial", order, data: payload })
          .select("id")
          .single();
        if (!error && data) {
          const newId = data.id as string;
          setItems((prev) => prev.map((it) => (it.id === openId ? { ...it, ...payload, id: newId } : it)));
        }
      } else {
        await supabase.from("blocks").update({ data: payload }).eq("id", openId);
        setItems((prev) => prev.map((it) => (it.id === openId ? { ...it, ...payload } : it)));
      }
    };
    persist().finally(() => closeModal());
  };

  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const name = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(name, file);
      if (error) { console.error(error); return null; }
      return name; // store path only; render via mediaPublicUrl
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return (
    <section className="bg-black py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Testimonials (Admin Preview)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (!pageId) return;
                setPublishing(true);
                const { data: secs, error: sErr } = await supabase
                  .from("sections")
                  .select("id, key, order")
                  .eq("page_id", pageId)
                  .order("order");
                if (sErr) { console.error(sErr); setPublishing(false); return; }
                const sectionsWithBlocks: any[] = [];
                for (const s of secs || []) {
                  const { data: blks } = await supabase
                    .from("blocks")
                    .select("type, data, order")
                    .eq("section_id", s.id)
                    .order("order");
                  sectionsWithBlocks.push({ key: s.key, order: s.order, blocks: blks || [] });
                }
                const snapshot = { slug: "testimonials", sections: sectionsWithBlocks };
                await supabase
                  .from("published_snapshots")
                  .upsert({ page_id: pageId, slug: "testimonials", data: snapshot, published_at: new Date().toISOString() });
                await supabase.from("pages").update({ status: "published" }).eq("id", pageId);
                setPublishing(false);
                alert("Testimonials published");
              }}
              disabled={publishing || !pageId}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black font-semibold disabled:opacity-60"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-end auto-rows-min">
            {items.map((t) => (
              <div
                key={t.id}
                className="relative group cursor-pointer"
                onClick={() => openModal(t.id)}
              >
                <div
                  className={`relative bg-zinc-900 overflow-hidden ${
                    t.size === "tall" ? "aspect-3/6" : "aspect-3/5"
                  }`}
                >
                  {t.mediaUrl ? (
                    t.mediaType === "video" ? (
                      <video
                        src={getDisplayUrl(t.mediaUrl)}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={getDisplayUrl(t.mediaUrl)}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141414] text-gray-500 text-xs">
                      No media
                    </div>
                  )}

                  {t.mediaType === "video" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shrink-0">
                      {t.avatarUrl ? (
                        <Image
                          src={getDisplayUrl(t.avatarUrl)}
                          alt={t.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <span className="text-[10px] text-gray-400">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-white text-xs font-medium truncate">
                      {t.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input pop-up modal */}
      {openId != null && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-xl mx-auto bg-[#0b0b0b] border border-white/10 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">
              Edit Testimonial
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-sm"
                  placeholder="Full name"
                />
              </div>

              {/* Main media settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Media Type
                  </label>
                  <select
                    value={draft.mediaType}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, mediaType: e.target.value as MediaType } : d
                      )
                    }
                    className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-sm"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Size
                  </label>
                  <select
                    value={draft.size}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, size: e.target.value as Size } : d
                      )
                    }
                    className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-sm"
                  >
                    <option value="normal">Regular (3:5)</option>
                    <option value="tall">Tall (3:6)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Main media URL
                  </label>
                  <input
                    value={draft.mediaUrl}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, mediaUrl: e.target.value } : d
                      )
                    }
                    className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-sm"
                    placeholder="https://... (image or video)"
                  />
                  <input
                    type="file"
                    accept={draft.mediaType === "video" ? "video/*" : "image/*"}
                    className="mt-2 block w-full text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const path = await uploadToStorage(f);
                      if (path) setDraft((d) => (d ? { ...d, mediaUrl: path } : d));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Avatar image URL
                  </label>
                  <input
                    value={draft.avatarUrl}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, avatarUrl: e.target.value } : d
                      )
                    }
                    className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-sm"
                    placeholder="https://... (image)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const path = await uploadToStorage(f);
                      if (path) setDraft((d) => (d ? { ...d, avatarUrl: path } : d));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-2 text-sm rounded bg-white/5 border border-white/10 text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveDraft}
                className="px-3 py-2 text-sm rounded bg-[#CCFF00] text-black font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
