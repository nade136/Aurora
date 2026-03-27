"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Plus, Trash2, GripVertical } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import TextStyleControls from "@/components/admin/TextStyleControls";
import { mediaPublicUrl } from "@/utils/media";
import { reviewsDummy } from "@/data/reviewsDummy";

// Types for each block
type HeroData = {
  title: string;
  subtitle?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
};
type SocialPlatform = 'x' | 'linkedin' | 'instagram' | 'facebook' | 'whatsapp';
type ReviewCard = { 
  icon?: string; 
  text: string; 
  author: string; 
  subtitle?: string; 
  avatar?: string; 
  avatarStyle?: TextStyle;
  socialUrlStyle?: TextStyle;
  textStyle?: TextStyle;
  authorStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  social: { 
    platform?: SocialPlatform; 
    url?: string;
    // Backward compatibility
    x?: string;
    linkedin?: string;
  } 
};
type Stat = {
  label: string;
  value: string;
  subtext?: string;
  valueStyle?: TextStyle;
  labelStyle?: TextStyle;
  subtextStyle?: TextStyle;
};
type TextStyle = { bold?: boolean; italic?: boolean; color?: string; fontFamily?: string; fontSize?: string };
type StatsHeaderData = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  badgeStyle?: TextStyle;
  titleLine1Style?: TextStyle;
  titleLine2Style?: TextStyle;
};
type FAQ = {
  question: string;
  answer: string;
  questionStyle?: TextStyle;
  answerStyle?: TextStyle;
};

type Block<T> = { id: string; order: number; type: string; data: T };

type TabKey = "hero" | "reviews_grid" | "stats" | "faq";

export default function ReviewsEditorPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<TabKey, string | null>>({ hero: null, reviews_grid: null, stats: null, faq: null });

  // Data per section
  const [hero, setHero] = useState<Block<HeroData> | null>(null);
  const [cards, setCards] = useState<Block<ReviewCard>[]>([]);
  const [statsHeader, setStatsHeader] = useState<Block<StatsHeaderData> | null>(null);
  const [stats, setStats] = useState<Block<Stat>[]>([]);
  const [faqs, setFaqs] = useState<Block<FAQ>[]>([]);

  const [active, setActive] = useState<TabKey>("hero");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickTarget, setPickTarget] = useState<{ id: string; field: "avatar" | "icon" } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [rankSearch, setRankSearch] = useState("");
  const [rankValue, setRankValue] = useState<number>(1);
  const formRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [publishing, setPublishing] = useState(false);
  const [localInputStyles, setLocalInputStyles] = useState<Record<string, TextStyle>>({});
  const localInputStyle = (key: string) => {
    const s = localInputStyles[key] || {};
    return { color: s.color, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.bold ? 700 : 400, fontStyle: s.italic ? "italic" : "normal" };
  };

  const scrollToEdit = (id: string) => {
    const el = formRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const input = el.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) input.focus();
    }, 300);
  };

  const setRank = async (id: string, rank1: number) => {
    const list = [...cards].sort((a, b) => a.order - b.order);
    const fromIdx = list.findIndex((b) => b.id === id);
    if (fromIdx < 0) return;
    const toIdx = Math.max(0, Math.min(rank1 - 1, list.length - 1));
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const normalized = list.map((b, idx) => ({ ...b, order: idx }));
    setCards(normalized);
    for (const b of normalized) {
      await supabase.from("blocks").update({ order: b.order }).eq("id", b.id);
    }
  };
  const setFaqRank = async (id: string, rank1: number) => {
    const list = [...faqs].sort((a, b) => a.order - b.order);
    const fromIdx = list.findIndex((b) => b.id === id);
    if (fromIdx < 0) return;
    const toIdx = Math.max(0, Math.min(rank1 - 1, list.length - 1));
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const normalized = list.map((b, idx) => ({ ...b, order: idx }));
    setFaqs(normalized);
    for (const b of normalized) {
      await supabase.from("blocks").update({ order: b.order }).eq("id", b.id);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // 1) page id
      const { data: p, error: pErr } = await supabase.from("pages").select("id").eq("slug", "reviews").single();
      if (pErr) { console.error(pErr); setLoading(false); return; }
      setPageId(p.id);

      // helper to ensure a section and return id
      const ensureSection = async (key: TabKey) => {
        const { data: s1 } = await supabase.from("sections").select("id").eq("page_id", p.id).eq("key", key).maybeSingle();
        if (s1?.id) return s1.id as string;
        const { data: s2, error: sErr } = await supabase.from("sections").insert({ page_id: p.id, key, order: 0 }).select("id").single();
        if (sErr) throw sErr; return s2.id as string;
      };

      const heroId = await ensureSection("hero");
      const gridId = await ensureSection("reviews_grid");
      const statsId = await ensureSection("stats");
      const faqId = await ensureSection("faq");
      setSections({ hero: heroId, reviews_grid: gridId, stats: statsId, faq: faqId });

      // hero block (single)
      const { data: heroBlk } = await supabase.from("blocks").select("id, order, type, data").eq("section_id", heroId).order("order").limit(1);
      setHero(heroBlk?.[0] as Block<HeroData> | null ?? null);

      // cards
      const { data: cardBlks } = await supabase.from("blocks").select("id, order, type, data").eq("section_id", gridId).order("order");
      setCards((cardBlks as Block<ReviewCard>[]) || []);

      // stats
      const { data: statBlks } = await supabase.from("blocks").select("id, order, type, data").eq("section_id", statsId).order("order");
      const statBlocks = (statBlks as Block<any>[]) || [];
      let statItems = statBlocks.filter((b) => b.type === "stat") as Block<Stat>[];
      const templates: Stat[] = [
        { value: "12", label: "Universities Reached", subtext: "" },
        { value: "50+", label: "Cohort 1 Students", subtext: "" },
        { value: "15", label: "Projects Delivered", subtext: "" },
      ];

      // Backfill old setups so admin always shows exactly 3 stat inputs.
      if (statItems.length < 3) {
        for (let i = statItems.length; i < 3; i += 1) {
          const { data: inserted, error: insertErr } = await supabase
            .from("blocks")
            .insert({
              section_id: statsId,
              type: "stat",
              order: i,
              data: templates[i],
            })
            .select("id, order, type, data")
            .single();

          if (insertErr) {
            console.error("Failed to create missing stat row", insertErr);
            break;
          }
          if (inserted) {
            statItems = [...statItems, inserted as Block<Stat>];
          }
        }
      }

      const sorted = statItems.sort((a, b) => a.order - b.order);
      const firstThree = sorted.slice(0, 3);
      const extras = sorted.slice(3);
      if (extras.length) {
        await supabase.from("blocks").delete().in("id", extras.map((e) => e.id));
      }

      setStatsHeader((statBlocks.find((b) => b.type === "stats_header") as Block<StatsHeaderData> | undefined) || null);
      setStats(firstThree.map((s, i) => ({ ...s, order: i })));

      // faqs
      const { data: faqBlks } = await supabase.from("blocks").select("id, order, type, data").eq("section_id", faqId).order("order");
      setFaqs((faqBlks as Block<FAQ>[]) || []);

      setLoading(false);
    };
    load();
  }, [supabase]);

  // Save helpers --------------------------------------------------
  const saveHero = async (patch: Partial<HeroData>) => {
    if (!sections.hero) return;
    const next = { ...(hero?.data || { title: "" }), ...patch } as HeroData;
    if (!hero) {
      const { data, error } = await supabase.from("blocks").insert({ section_id: sections.hero, type: "hero", order: 0, data: next }).select("id, order, type, data").single();
      if (error) return console.error(error);
      setHero(data as Block<HeroData>);
    } else {
      const { error } = await supabase.from("blocks").update({ data: next }).eq("id", hero.id);
      if (error) return console.error(error);
      setHero({ ...hero, data: next });
    }
  };

  const addCard = async () => {
    if (!sections.reviews_grid) return;
    const { data, error } = await supabase
      .from("blocks")
      .insert({
        section_id: sections.reviews_grid,
        type: "reviews_card",
        order: cards.length,
        data: {
          icon: "",
          text: "",
          author: "",
          social: {
            platform: undefined,
            url: ""
          },
        },
      })
      .select("id, order, type, data")
      .single();
    if (!error && data) setCards([...cards, data as Block<ReviewCard>]);
  };
  const updateCard = async (id: string, patch: Partial<ReviewCard>) => {
    const t = cards.find((b) => b.id === id); if (!t) return;
    const next = { ...t.data, ...patch };
    setCards((prev) => prev.map((b) => (b.id === id ? { ...b, data: next } : b)));
    const { error } = await supabase.from("blocks").update({ data: next }).eq("id", id);
    if (error) console.error(error);
  };
  const removeCard = async (id: string) => {
    await supabase.from("blocks").delete().eq("id", id);
    setCards((prev) => prev.filter((b) => b.id !== id));
  };

  // Image helpers (Choose/Upload)
  const chooseImage = (id: string, field: "avatar" | "icon") => {
    setPickTarget({ id, field });
    setPickerOpen(true);
  };
  const onMediaSelect = (path: string) => {
    if (!pickTarget) return;
    const t = cards.find((b) => b.id === pickTarget.id); if (!t) return;
    const patch = { ...(t.data as any), [pickTarget.field]: path } as Partial<ReviewCard>;
    updateCard(pickTarget.id, patch);
    setPickerOpen(false);
    setPickTarget(null);
  };
  const uploadFor = async (id: string, field: "avatar" | "icon", file: File | null) => {
    if (!file) return;
    setUploadingId(id + ":" + field);
    const name = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(name, file);
    setUploadingId(null);
    if (!error) updateCard(id, { [field]: name } as any);
  };

  const addStat = async () => {
    if (!sections.stats) return;
    const order = (stats[stats.length - 1]?.order ?? -1) + 1;
    const base: Stat = { label: "Label", value: "0", subtext: "" };
    const { data, error } = await supabase.from("blocks").insert({ section_id: sections.stats, type: "stat", order, data: base }).select("id, order, type, data").single();
    if (error) return console.error(error);
    setStats((prev) => [...prev, data as Block<Stat>]);
  };
  const updateStat = async (id: string, patch: Partial<Stat>) => {
    const t = stats.find((b) => b.id === id); if (!t) return;
    const next = { ...t.data, ...patch };
    setStats((prev) => prev.map((b) => (b.id === id ? { ...b, data: next } : b)));
    const { error } = await supabase.from("blocks").update({ data: next }).eq("id", id);
    if (error) console.error(error);
  };
  const removeStat = async (id: string) => {
    await supabase.from("blocks").delete().eq("id", id);
    setStats((prev) => prev.filter((b) => b.id !== id));
  };

  const saveStatsHeader = async (patch: Partial<StatsHeaderData>) => {
    if (!sections.stats) return;
    const next = {
      badge: "STATISTICS",
      titleLine1: "WE HAVE THE",
      titleLine2: "NUMBERS",
      badgeStyle: {},
      titleLine1Style: {},
      titleLine2Style: {},
      ...(statsHeader?.data || {}),
      ...patch,
    } as StatsHeaderData;

    if (!statsHeader) {
      const { data, error } = await supabase
        .from("blocks")
        .insert({
          section_id: sections.stats,
          type: "stats_header",
          order: -1,
          data: next,
        })
        .select("id, order, type, data")
        .single();
      if (error) return console.error(error);
      setStatsHeader(data as Block<StatsHeaderData>);
      return;
    }

    const { error } = await supabase.from("blocks").update({ data: next }).eq("id", statsHeader.id);
    if (error) return console.error(error);
    setStatsHeader({ ...statsHeader, data: next });
  };

  const setStatsTextStyle = async (
    field: "badgeStyle" | "titleLine1Style" | "titleLine2Style",
    style: TextStyle
  ) => {
    await saveStatsHeader({ [field]: style } as Partial<StatsHeaderData>);
  };

  const addFaq = async () => {
    if (!sections.faq) return;
    const order = (faqs[faqs.length - 1]?.order ?? -1) + 1;
    const base: FAQ = { question: "Question?", answer: "Answer…" };
    const { data, error } = await supabase.from("blocks").insert({ section_id: sections.faq, type: "faq_item", order, data: base }).select("id, order, type, data").single();
    if (error) return console.error(error);
    setFaqs((prev) => [...prev, data as Block<FAQ>]);
  };
  const updateFaq = async (id: string, patch: Partial<FAQ>) => {
    const t = faqs.find((b) => b.id === id); if (!t) return;
    const next = { ...t.data, ...patch };
    setFaqs((prev) => prev.map((b) => (b.id === id ? { ...b, data: next } : b)));
    const { error } = await supabase.from("blocks").update({ data: next }).eq("id", id);
    if (error) console.error(error);
  };
  const removeFaq = async (id: string) => {
    await supabase.from("blocks").delete().eq("id", id);
    setFaqs((prev) => prev.filter((b) => b.id !== id));
  };

  const move = async (list: Block<any>[], setList: any, id: string, dir: -1 | 1) => {
    const idx = list.findIndex((b) => b.id === id);
    const j = idx + dir; if (idx < 0 || j < 0 || j >= list.length) return;
    const swapped = [...list]; const tmp = swapped[idx];
    swapped[idx] = { ...swapped[j], order: swapped[idx].order };
    swapped[j] = { ...tmp, order: swapped[j].order };
    setList(swapped);
    await supabase.from("blocks").update({ order: swapped[idx].order }).eq("id", swapped[idx].id);
    await supabase.from("blocks").update({ order: swapped[j].order }).eq("id", swapped[j].id);
  };

  const publish = async () => {
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

    const snapshot = { slug: "reviews", sections: sectionsWithBlocks };
    await supabase.from("published_snapshots").upsert({ page_id: pageId, slug: "reviews", data: snapshot, published_at: new Date().toISOString() });
    await supabase.from("pages").update({ status: "published" }).eq("id", pageId);
    setPublishing(false);
    alert("Reviews published");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-white/10">
          {(["hero","reviews_grid","stats","faq"] as TabKey[]).map(t => (
            <button key={t} onClick={()=>setActive(t)} className={`px-3 py-2 text-sm border-b-2 ${active===t?"border-[#CCFF00] text-white":"border-transparent text-gray-400"}`}>{t.replace("_"," ")}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={publish} disabled={publishing || !pageId} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black font-semibold disabled:opacity-60">
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* HERO */}
      {active === "hero" && (
        <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
          <label className="text-sm text-gray-300">Title
            <input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={hero?.data.title || ""} onChange={(e)=>saveHero({ title: e.target.value })}/>
          </label>
          <TextStyleControls
            value={hero?.data.titleStyle}
            onChange={(next) => saveHero({ titleStyle: next })}
            defaultColor="#ffffff"
          />
          <label className="text-sm text-gray-300">Subtitle
            <input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={hero?.data.subtitle || ""} onChange={(e)=>saveHero({ subtitle: e.target.value })}/>
          </label>
          <TextStyleControls
            value={hero?.data.subtitleStyle}
            onChange={(next) => saveHero({ subtitleStyle: next })}
            defaultColor="#9ca3af"
          />
        </div>
      )}

      {/* CARDS */}
      {active === "reviews_grid" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Review cards</div>
            <button onClick={addCard} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black text-xs font-semibold"><Plus className="w-4 h-4"/>Add card</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span>Rank by name</span>
            <input value={rankSearch} onChange={(e)=>setRankSearch(e.target.value)} placeholder="Type name..." className="bg-transparent border border-white/10 rounded px-2 py-1.5 text-xs" style={localInputStyle("rankSearch")} />
            <TextStyleControls value={localInputStyles.rankSearch} onChange={(next)=>setLocalInputStyles(s=>({...s, rankSearch: next}))} defaultColor="#ffffff" />
            <span>to</span>
            <select className="bg-transparent border border-white/10 rounded px-1 py-1 text-xs" value={rankValue} onChange={(e)=>setRankValue(Number(e.target.value))}>
              {Array.from({ length: Math.max(1, cards.length) }).map((_, idx) => (<option key={idx+1} value={idx+1}>{idx+1}</option>))}
            </select>
            <button className="px-2 py-1.5 rounded bg-white/5 border border-white/10" onClick={()=>{ const q=rankSearch.trim().toLowerCase(); if(!q) return; const list=[...cards].sort((a,b)=>a.order-b.order); const m=list.find(b=> (b.data.author||"").toLowerCase().includes(q)); if(m) setRank(m.id, rankValue); }}>Set</button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
            {cards.length===0 && (
              <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                <div className="text-sm text-gray-400">No cards yet.</div>
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black text-xs font-semibold"
                  onClick={async ()=>{
                    if (!sections.reviews_grid) return;
                    const payloads = reviewsDummy.map((d: any, idx: number) => ({
                      section_id: sections.reviews_grid as string,
                      type: "reviews_card" as const,
                      order: idx,
                      data: {
                        icon: d.icon || "",
                        text: d.text || "",
                        author: d.author || "",
                        subtitle: d.subtitle || "",
                        avatar: d.avatar || "",
                        size: d.size || "large",
                        social: d.social || null,
                      },
                    }));
                    const { data, error } = await supabase
                      .from("blocks")
                      .insert(payloads)
                      .select("id, order, type, data");
                    if (!error && data) setCards(data as any);
                  }}
                >
                  Import default reviews
                </button>
              </div>
            )}
            {cards.map((b,i)=>(
              <div key={b.id} ref={(el)=>{ formRefs.current[b.id]=el; }} className="rounded-lg border border-white/10 p-3 bg-black/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <GripVertical className="w-3 h-3"/>#{i+1} • {(b.data.author||"Unnamed")} {b.data.subtitle?`— ${b.data.subtitle}`:""}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1 text-xs">
                      <span>Rank</span>
                      <select className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-xs" value={i+1} onChange={(e)=>setRank(b.id, Number(e.target.value))}>
                        {Array.from({ length: cards.length }).map((_, idx) => (<option key={idx+1} value={idx+1}>{idx+1}</option>))}
                      </select>
                    </div>
                    <button onClick={()=>move(cards,setCards,b.id,-1)} className="px-2 py-1 text-xs rounded bg-white/5">Up</button>
                    <button onClick={()=>move(cards,setCards,b.id,1)} className="px-2 py-1 text-xs rounded bg-white/5">Down</button>
                    <button onClick={()=>removeCard(b.id)} className="px-2 py-1 text-xs rounded bg-white/5 text-red-400"><Trash2 className="w-3 h-3"/></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm text-gray-300">Text<textarea rows={3} className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.text||""} onChange={(e)=>updateCard(b.id,{ text:e.target.value })}/></label>
                  <TextStyleControls value={b.data.textStyle} onChange={(next)=>updateCard(b.id,{ textStyle: next })} defaultColor="#d1d5db" />
                  <label className="text-sm text-gray-300">Author<input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.author||""} onChange={(e)=>updateCard(b.id,{ author:e.target.value })}/></label>
                  <TextStyleControls value={b.data.authorStyle} onChange={(next)=>updateCard(b.id,{ authorStyle: next })} defaultColor="#ffffff" />
                  <label className="text-sm text-gray-300">Subtitle<input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.subtitle||""} onChange={(e)=>updateCard(b.id,{ subtitle:e.target.value })}/></label>
                  <TextStyleControls value={b.data.subtitleStyle} onChange={(next)=>updateCard(b.id,{ subtitleStyle: next })} defaultColor="#9ca3af" />
                  {/* Badge/icon section commented out - 2025-12-02
                  <div className="text-sm text-gray-300">
                    Badge/icon (top-left)
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 border border-white/10">
                        {b.data.icon ? <img src={mediaPublicUrl(b.data.icon)} alt="icon" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">None</div>}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.icon||""} onChange={(e)=>updateCard(b.id,{ icon:e.target.value })} placeholder="Storage path or URL" />
                        <button type="button" onClick={()=>chooseImage(b.id, "icon")} className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10">Choose</button>
                        <label className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 cursor-pointer">
                          {uploadingId === b.id + ":icon" ? "Uploading…" : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadFor(b.id, "icon", e.target.files?.[0]||null)} />
                        </label>
                      </div>
                    </div>
                  </div>
                  */}
                  <div className="text-sm text-gray-300">
                    Reviewer avatar photo
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-white/5 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {b.data.avatar ? <img src={mediaPublicUrl(b.data.avatar)} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">None</div>}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.avatar||""} onChange={(e)=>updateCard(b.id,{ avatar:e.target.value })} placeholder="Storage path or URL" style={{ color: b.data.avatarStyle?.color, fontFamily: b.data.avatarStyle?.fontFamily, fontSize: b.data.avatarStyle?.fontSize, fontWeight: b.data.avatarStyle?.bold ? 700 : 400, fontStyle: b.data.avatarStyle?.italic ? "italic" : "normal" }} />
                        <button type="button" onClick={()=>chooseImage(b.id, "avatar")} className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10">Choose</button>
                        <label className="px-2 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 cursor-pointer">
                          {uploadingId === b.id + ":avatar" ? "Uploading…" : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadFor(b.id, "avatar", e.target.files?.[0]||null)} />
                        </label>
                      </div>
                    </div>
                    <TextStyleControls value={b.data.avatarStyle} onChange={(next)=>updateCard(b.id,{ avatarStyle: next })} defaultColor="#ffffff" />
                  </div>
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-300 block mb-1">Social Platform</label>
                      <select 
                        className="w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm"
                        value={b.data.social?.platform || ""}
                        onChange={(e) => {
                          const platform = e.target.value as SocialPlatform | "";
                          updateCard(b.id, { 
                            social: { 
                              ...b.data.social, 
                              platform: platform === "" ? undefined : platform 
                            } 
                          });
                        }}
                      >
                        <option value="">Select platform</option>
                        <option value="x">X (Twitter)</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 block mb-1">
                        {b.data.social?.platform === 'whatsapp' 
                          ? 'Phone number (with country code)' 
                          : b.data.social?.platform
                            ? `${b.data.social.platform.charAt(0).toUpperCase() + b.data.social.platform.slice(1)} URL`
                            : 'Social URL'}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" 
                          value={b.data.social?.url || ""}
                          style={{ color: b.data.socialUrlStyle?.color, fontFamily: b.data.socialUrlStyle?.fontFamily, fontSize: b.data.socialUrlStyle?.fontSize, fontWeight: b.data.socialUrlStyle?.bold ? 700 : 400, fontStyle: b.data.socialUrlStyle?.italic ? "italic" : "normal" }}
                          onChange={(e) => {
                            let url = e.target.value;
                            // Auto-format WhatsApp URLs
                            if (b.data.social?.platform === 'whatsapp' && url && !url.startsWith('https://wa.me/') && !url.startsWith('http')) {
                              // Remove all non-numeric characters except '+' at start
                              const cleanNumber = url.replace(/[^0-9+]/g, '');
                              url = `https://wa.me/${cleanNumber}`;
                            }
                            updateCard(b.id, { 
                              social: { 
                                ...b.data.social, 
                                url: url 
                              } 
                            });
                          }}
                          placeholder={
                            b.data.social?.platform === 'whatsapp' 
                              ? 'e.g., 1234567890' 
                              : b.data.social?.platform === 'instagram'
                                ? 'e.g., https://instagram.com/username'
                                : b.data.social?.platform === 'facebook'
                                  ? 'e.g., https://facebook.com/username'
                                  : b.data.social?.platform === 'x'
                                    ? 'e.g., https://x.com/username'
                                    : b.data.social?.platform === 'linkedin'
                                      ? 'e.g., https://linkedin.com/in/username'
                                      : 'Enter URL'
                          }
                        />
                      </div>
                      <TextStyleControls value={b.data.socialUrlStyle} onChange={(next)=>updateCard(b.id,{ socialUrlStyle: next })} defaultColor="#ffffff" />
                      {b.data.social?.platform === 'whatsapp' && b.data.social?.url && (
                        <div className="text-xs text-gray-400 mt-1">
                          WhatsApp link: <span className="text-blue-400 break-all">{b.data.social.url}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview (click to edit) */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <div className="rounded-xl border border-white/10 bg-[#111] p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((review)=> (
                  <div key={review.id} className="cursor-pointer" onClick={()=>scrollToEdit(review.id)}>
                    <div className={`relative flex flex-col bg-[#151515] rounded-2xl border-2 border-[#2b2b2b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 border border-white/10 bg-[#1d1d1d]">
                        <div className="scale-110">{review.data.social?.x ? "X" : review.data.social?.linkedin ? "in" : "i"}</div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mt-3">{review.data.text||""}</p>
                      <div className="mt-auto pt-3">
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 p-2 bg-[#141414]">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {review.data.avatar && <img src={mediaPublicUrl(review.data.avatar)} alt="avatar" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm tracking-tight">{review.data.author||""}</span>
                            <span className="text-gray-400 text-[11px]">{review.data.subtitle||""}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      {active === "stats" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
            <div className="font-semibold">Statistics Heading</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Badge text (STATISTICS)</label>
                <input
                  className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                  value={statsHeader?.data.badge || ""}
                  onChange={(e) => saveStatsHeader({ badge: e.target.value })}
                  placeholder="e.g., STATISTICS"
                />
                <TextStyleControls
                  value={statsHeader?.data?.badgeStyle}
                  onChange={(next) => setStatsTextStyle("badgeStyle", next)}
                  defaultColor="#ccff00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Heading line 1 (WE HAVE THE)</label>
                <input
                  className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                  value={statsHeader?.data.titleLine1 || ""}
                  onChange={(e) => saveStatsHeader({ titleLine1: e.target.value })}
                  placeholder="e.g., WE HAVE THE"
                />
                <TextStyleControls
                  value={statsHeader?.data?.titleLine1Style}
                  onChange={(next) => setStatsTextStyle("titleLine1Style", next)}
                  defaultColor="#ffffff"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Heading line 2 (NUMBERS)</label>
                <input
                  className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                  value={statsHeader?.data.titleLine2 || ""}
                  onChange={(e) => saveStatsHeader({ titleLine2: e.target.value })}
                  placeholder="e.g., NUMBERS"
                />
                <TextStyleControls
                  value={statsHeader?.data?.titleLine2Style}
                  onChange={(next) => setStatsTextStyle("titleLine2Style", next)}
                  defaultColor="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-semibold">Statistics (3 fixed numbers)</div>
          </div>
          
          {/* Stats Editor */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
            {stats.length === 0 ? (
              <div className="text-sm text-gray-400 p-4 text-center">No stats added yet. Click 'Add Stat' to get started.</div>
            ) : (
              stats.map((b, i) => (
                <div key={b.id} className="rounded-lg border border-white/10 p-4 bg-black/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <GripVertical className="w-3 h-3"/>
                      <span>Stat #{i + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => move(stats, setStats, b.id, -1)} 
                        className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors"
                        disabled
                      >
                        Up
                      </button>
                      <button 
                        onClick={() => move(stats, setStats, b.id, 1)} 
                        className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 transition-colors"
                        disabled
                      >
                        Down
                      </button>
                      <button 
                        onClick={() => removeStat(b.id)} 
                        className="px-2 py-1 text-xs rounded bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                        disabled
                      >
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        {i === 0 ? "Left number" : i === 1 ? "Middle number" : "Right number"}
                      </label>
                      <input 
                        className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                        value={b.data.value || ""} 
                        onChange={(e) => updateStat(b.id, { value: e.target.value })}
                        placeholder="e.g., 100%"
                      />
                      <TextStyleControls
                        value={b.data.valueStyle}
                        onChange={(next) => updateStat(b.id, { valueStyle: next })}
                        defaultColor="#ffffff"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Represents</label>
                      <input 
                        className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                        value={b.data.label || ""} 
                        onChange={(e) => updateStat(b.id, { label: e.target.value })}
                        placeholder="e.g., Universities Reached"
                      />
                      <TextStyleControls
                        value={b.data.labelStyle}
                        onChange={(next) => updateStat(b.id, { labelStyle: next })}
                        defaultColor="#9ca3af"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Extra note (optional)</label>
                      <input
                        className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#CCFF00]/50 focus:ring-1 focus:ring-[#CCFF00]/30 transition-colors"
                        value={b.data.subtext || ""}
                        onChange={(e) => updateStat(b.id, { subtext: e.target.value })}
                        placeholder="Optional"
                      />
                      <TextStyleControls
                        value={b.data.subtextStyle}
                        onChange={(next) => updateStat(b.id, { subtextStyle: next })}
                        defaultColor="#6b7280"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Section */}
          {stats.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.id} className="bg-[#151515] rounded-xl p-6 border border-white/10">
                    <div className="text-3xl font-bold text-[#CCFF00] mb-2">{stat.data.value || "0"}</div>
                    <div className="text-sm text-gray-300">{stat.data.label || "Stat Label"}</div>
                    {stat.data.subtext ? (
                      <div className="text-xs text-gray-500 mt-1">{stat.data.subtext}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      {active === "faq" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">FAQ</div>
            <button onClick={addFaq} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#CCFF00] text-black text-xs font-semibold"><Plus className="w-4 h-4"/>Add question</button>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
            {faqs.length===0 && <div className="text-sm text-gray-400">No questions yet.</div>}
            {faqs.map((b,i)=>(
              <div key={b.id} className="rounded-lg border border-white/10 p-3 bg-black/30">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 text-xs text-gray-400"><GripVertical className="w-3 h-3"/>#{i+1}</div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-1 text-xs">
                      <span>Order</span>
                      <select className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-xs" value={i+1} onChange={(e)=>setFaqRank(b.id, Number(e.target.value))}>
                        {Array.from({ length: faqs.length }).map((_, idx) => (<option key={idx+1} value={idx+1}>{idx+1}</option>))}
                      </select>
                    </div>
                    <button onClick={()=>move(faqs,setFaqs,b.id,-1)} className="px-2 py-1 text-xs rounded bg-white/5">Up</button><button onClick={()=>move(faqs,setFaqs,b.id,1)} className="px-2 py-1 text-xs rounded bg-white/5">Down</button><button onClick={()=>removeFaq(b.id)} className="px-2 py-1 text-xs rounded bg-white/5 text-red-400"><Trash2 className="w-3 h-3"/></button>
                  </div></div>
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-sm text-gray-300">Question<input className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.question||""} onChange={(e)=>updateFaq(b.id,{ question:e.target.value })}/></label>
                  <TextStyleControls value={b.data.questionStyle} onChange={(next)=>updateFaq(b.id,{ questionStyle: next })} defaultColor="#ffffff" />
                  <label className="text-sm text-gray-300">Answer<textarea rows={3} className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm" value={b.data.answer||""} onChange={(e)=>updateFaq(b.id,{ answer:e.target.value })}/></label>
                  <TextStyleControls value={b.data.answerStyle} onChange={(next)=>updateFaq(b.id,{ answerStyle: next })} defaultColor="#9ca3af" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

