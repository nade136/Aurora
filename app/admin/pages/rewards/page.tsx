"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Plus, Trash2, GripVertical } from "lucide-react";
import RewardCard, { RewardItem } from "@/components/renderers/RewardCard";
import { mediaPublicUrl } from "@/utils/media";
import { rewardsDummy } from "@/data/rewardsDummy";
import MediaPicker from "@/components/admin/MediaPicker";

type AwardData = {
  key?: string;
  title: string;
  quote?: string;
  icon?: string;
  name: string;
  portrait?: string;
  description?: string;
};

type Block = { id: string; order: number; type: string; data: AwardData };

export default function RewardsEditorPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickTarget, setPickTarget] = useState<{ id: string; field: "icon" | "portrait" } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [rankSearch, setRankSearch] = useState("");
  const [rankValue, setRankValue] = useState<number>(1);
  const formRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // 1) get page
      const { data: pages, error: pErr } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "rewards")
        .limit(1);
      if (pErr) {
        console.error(pErr);
        setLoading(false);
        return;
      }
      const pageId = pages?.[0]?.id as string | undefined;
      if (!pageId) {
        console.error("Page 'rewards' not found. Run schema seed.");
        setLoading(false);
        return;
      }
      // 2) ensure section 'awards'
      const { data: secList, error: sErr } = await supabase
        .from("sections")
        .select("id")
        .eq("page_id", pageId)
        .eq("key", "awards")
        .limit(1);
      if (sErr) {
        console.error(sErr);
        setLoading(false);
        return;
      }
      let sid = secList?.[0]?.id as string | undefined;
      if (!sid) {
        const { data: created, error: cErr } = await supabase
          .from("sections")
          .insert({ page_id: pageId, key: "awards", order: 0 })
          .select("id")
          .single();
        if (cErr) {
          console.error(cErr);
          setLoading(false);
          return;
        }
        sid = created.id;
      }
      setSectionId(sid ?? null);

      // 3) fetch blocks
      const { data: blks, error: bErr } = await supabase
        .from("blocks")
        .select("id, order, type, data")
        .eq("section_id", sid)
        .order("order", { ascending: true });
      if (bErr) console.error(bErr);
      setBlocks((blks as Block[]) || []);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const publish = async () => {
    setPublishing(true);
    // 1) get page
    const { data: pageRow, error: pErr } = await supabase
      .from("pages")
      .select("id, slug")
      .eq("slug", "rewards")
      .single();
    if (pErr) { console.error(pErr); setPublishing(false); return; }
    const pageId = pageRow.id as string;

    // 2) collect sections and blocks
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

    const snapshot = { slug: "rewards", sections: sectionsWithBlocks };

    // 3) upsert snapshot and set published status
    await supabase.from("published_snapshots").upsert({ page_id: pageId, slug: "rewards", data: snapshot, published_at: new Date().toISOString() });
    await supabase.from("pages").update({ status: "published" }).eq("id", pageId);
    setPublishing(false);
    alert("Rewards published");
  };

  const addAward = async () => {
    if (!sectionId) return;
    setSaving(true);
    const newOrder = (blocks[blocks.length - 1]?.order ?? -1) + 1;
    const payload: AwardData = {
      title: "New Award Title",
      name: "Recipient Name",
      description: "Short description...",
      key: "custom",
    };
    const { data, error } = await supabase
      .from("blocks")
      .insert({ section_id: sectionId, type: "award_winner", order: newOrder, data: payload })
      .select("id, order, type, data")
      .single();
    setSaving(false);
    if (error) return console.error(error);
    setBlocks((prev) => [...prev, data as Block]);
  };

  const removeAward = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from("blocks").delete().eq("id", id);
    setSaving(false);
    if (error) return console.error(error);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateAward = async (id: string, patch: Partial<AwardData>) => {
    const target = blocks.find((b) => b.id === id);
    if (!target) return;
    const nextData = { ...target.data, ...patch };
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: nextData } : b)));
    const { error } = await supabase.from("blocks").update({ data: nextData }).eq("id", id);
    if (error) console.error(error);
  };

  const chooseImage = (id: string, field: "icon" | "portrait") => {
    setPickTarget({ id, field });
    setPickerOpen(true);
  };

  const onMediaSelect = (path: string) => {
    if (!pickTarget) return;
    updateAward(pickTarget.id, { [pickTarget.field]: path } as any);
    setPickerOpen(false);
    setPickTarget(null);
  };

  const uploadFor = async (id: string, field: "icon" | "portrait", file: File | null) => {
    if (!file) return;
    setUploadingId(id + ":" + field);
    const name = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(name, file);
    setUploadingId(null);
    if (!error) {
      await updateAward(id, { [field]: name } as any);
    } else {
      console.error(error);
    }
  };

  const scrollToEdit = (id: string) => {
    const el = formRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const input = el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) input.focus();
    }, 350);
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= blocks.length) return;
    const swapped = [...blocks];
    const tmp = swapped[idx];
    swapped[idx] = { ...swapped[j], order: swapped[idx].order };
    swapped[j] = { ...tmp, order: swapped[j].order };
    setBlocks(swapped);
    // persist orders
    await supabase.from("blocks").update({ order: swapped[idx].order }).eq("id", swapped[idx].id);
    await supabase.from("blocks").update({ order: swapped[j].order }).eq("id", swapped[j].id);
  };

  const setRank = async (id: string, rank1: number) => {
    const list = [...blocks].sort((a, b) => a.order - b.order);
    const fromIdx = list.findIndex((b) => b.id === id);
    if (fromIdx < 0) return;
    const toIdx = Math.max(0, Math.min(rank1 - 1, list.length - 1));
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    // normalize orders
    const normalized = list.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(normalized);
    // persist all order updates
    for (const b of normalized) {
      await supabase.from("blocks").update({ order: b.order }).eq("id", b.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rewards Editor</h1>
        <div className="flex items-center gap-2">
          <button onClick={addAward} disabled={saving || loading} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-white border border-white/10 disabled:opacity-60">
            <Plus className="w-4 h-4" /> Add award
          </button>
          <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black font-semibold disabled:opacity-60">
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>Rank by name</span>
        <input
          value={rankSearch}
          onChange={(e) => setRankSearch(e.target.value)}
          placeholder="Type name..."
          className="bg-transparent border border-white/10 rounded px-2 py-1.5 text-xs"
        />
        <span>to</span>
        <select
          className="bg-transparent border border-white/10 rounded px-1 py-1 text-xs"
          value={rankValue}
          onChange={(e) => setRankValue(Number(e.target.value))}
        >
          {Array.from({ length: Math.max(1, blocks.length) }).map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
          ))}
        </select>
        <button
          onClick={() => {
            const q = rankSearch.trim().toLowerCase();
            if (!q) return;
            const list = [...blocks].sort((a, b) => a.order - b.order);
            const match = list.find((b) => (b.data.name || "").toLowerCase().includes(q));
            if (match) setRank(match.id, rankValue);
          }}
          className="px-2 py-1.5 rounded bg-white/5 border border-white/10"
        >
          Set
        </button>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
            <div className="text-sm text-gray-400">No awards yet.</div>
            <button
              onClick={async () => {
                if (!sectionId) return;
                const payloads = rewardsDummy.map((d, idx) => ({
                  section_id: sectionId,
                  type: "award_winner" as const,
                  order: idx,
                  data: {
                    key: d.key,
                    title: d.title,
                    quote: d.quote,
                    icon: d.icon || "",
                    name: d.name,
                    portrait: d.portrait || "",
                    description: typeof d.description === "string" ? d.description : "",
                  },
                }));
                const { data, error } = await supabase
                  .from("blocks")
                  .insert(payloads)
                  .select("id, order, type, data");
                if (!error && data) setBlocks(data as any);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black text-xs font-semibold"
            >
              Import default awards
            </button>
          </div>
        ) : (
          blocks.map((b, i) => (
            <div
              key={b.id}
              ref={(el) => {
                formRefs.current[b.id] = el;
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <GripVertical className="w-3 h-3" /> #{i + 1}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span>Rank</span>
                    <select
                      className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-xs"
                      value={i + 1}
                      onChange={(e) => setRank(b.id, Number(e.target.value))}
                    >
                      {Array.from({ length: blocks.length }).map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => move(b.id, -1)} className="px-2 py-1 text-xs rounded bg-white/5">Up</button>
                  <button onClick={() => move(b.id, 1)} className="px-2 py-1 text-xs rounded bg-white/5">Down</button>
                  <button onClick={() => removeAward(b.id)} className="px-2 py-1 text-xs rounded bg-white/5 text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm text-gray-300">Title
                  <input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.title || ""} onChange={(e) => updateAward(b.id, { title: e.target.value })} />
                </label>
                <label className="text-sm text-gray-300">Name
                  <input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.name || ""} onChange={(e) => updateAward(b.id, { name: e.target.value })} />
                </label>
                <label className="text-sm text-gray-300 sm:col-span-2">Quote
                  <input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.quote || ""} onChange={(e) => updateAward(b.id, { quote: e.target.value })} />
                </label>
                <div className="text-sm text-gray-300">
                  Award trophy icon
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {b.data.icon ? <img src={mediaPublicUrl(b.data.icon)} alt="icon" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">None</div>}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.icon || ""} onChange={(e) => updateAward(b.id, { icon: e.target.value })} placeholder="Storage path or URL" />
                      <button type="button" onClick={() => chooseImage(b.id, "icon")} className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10">Choose</button>
                      <label className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 cursor-pointer">
                        {uploadingId === b.id + ":icon" ? "Uploading…" : "Upload"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFor(b.id, "icon", e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  Recipient portrait photo
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {b.data.portrait ? <img src={mediaPublicUrl(b.data.portrait)} alt="portrait" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">None</div>}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.portrait || ""} onChange={(e) => updateAward(b.id, { portrait: e.target.value })} placeholder="Storage path or URL" />
                      <button type="button" onClick={() => chooseImage(b.id, "portrait")} className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10">Choose</button>
                      <label className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 cursor-pointer">
                        {uploadingId === b.id + ":portrait" ? "Uploading…" : "Upload"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFor(b.id, "portrait", e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                </div>
                <label className="text-sm text-gray-300 sm:col-span-2">Description
                  <textarea className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" rows={3} value={b.data.description || ""} onChange={(e) => updateAward(b.id, { description: e.target.value })} />
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Preview</h2>
        <div className="rounded-xl border border-white/10 bg-[#111] p-4">
          {(() => {
            const items: RewardItem[] = blocks.length > 0
              ? blocks.map((b) => ({
                  key: b.data.key || "custom",
                  title: b.data.title || "",
                  quote: b.data.quote || undefined,
                  icon: b.data.icon ? mediaPublicUrl(b.data.icon) : undefined,
                  name: b.data.name || "",
                  portrait: b.data.portrait ? mediaPublicUrl(b.data.portrait) : undefined,
                  description: b.data.description || "",
                }))
              : rewardsDummy;

            return (
              <div className="space-y-4">
                {blocks.length > 0
                  ? blocks.map((b) => (
                      <div key={b.id} className="cursor-pointer" onClick={() => scrollToEdit(b.id)}>
                        <RewardCard item={{
                          key: b.data.key || "custom",
                          title: b.data.title || "",
                          quote: b.data.quote || undefined,
                          icon: b.data.icon ? mediaPublicUrl(b.data.icon) : undefined,
                          name: b.data.name || "",
                          portrait: b.data.portrait ? mediaPublicUrl(b.data.portrait) : undefined,
                          description: b.data.description || "",
                        }} />
                      </div>
                    ))
                  : items.map((it) => (
                      <RewardCard key={it.key + it.name} item={it} />
                    ))}
              </div>
            );
          })()}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickTarget(null);
        }}
        onSelect={onMediaSelect}
      />
    </div>
  );
};
