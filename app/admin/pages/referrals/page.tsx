"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Plus, Copy, RefreshCcw, Check, X } from "lucide-react";

type Referral = {
  id: string;
  code: string;
  name: string | null;
  active: boolean;
  created_at: string;
};

type Row = Referral & { clicks?: number };

export default function ReferralsAdminPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [list, setList] = useState<Row[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
    }
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referral_links")
      .select("id, code, name, active, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    // Fetch click counts (best-effort)
    const rows: Row[] = [];
    for (const r of data as Referral[]) {
      let clicks = 0;
      const { count } = await supabase
        .from("referral_clicks")
        .select("id", { count: "exact", head: true })
        .eq("referral_id", r.id);
      clicks = count || 0;
      rows.push({ ...r, clicks });
    }
    setList(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const code1 = code.trim();
    if (!code1) return;
    setCreating(true);
    const payload = {
      code: code1.toUpperCase(),
      name: name.trim() || null,
      active: true,
    };
    const { data, error } = await supabase
      .from("referral_links")
      .insert(payload)
      .select("id, code, name, active, created_at")
      .single();
    setCreating(false);
    if (error) {
      alert(error.message || "Failed to create code");
      return;
    }
    setCode("");
    setName("");
    setList((prev) => [{ ...(data as Referral), clicks: 0 }, ...prev]);
  };

  const toggle = async (id: string, active: boolean) => {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    const { error } = await supabase.from("referral_links").update({ active }).eq("id", id);
    if (error) console.error(error);
  };

  const remove = async (id: string) => {
    const ok = confirm("Delete this referral code?");
    if (!ok) return;
    const old = list;
    setList((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase.from("referral_links").delete().eq("id", id);
    if (error) {
      alert("Delete failed");
      setList(old);
    }
  };

  const copyLink = async (c: string) => {
    const link = `${origin}/Aurora/${c}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied: " + link);
    } catch (e) {
      prompt("Copy link", link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Referrals</div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
          <RefreshCcw className="w-4 h-4" /> Reload
        </button>
      </div>

      {/* Create */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm text-gray-300">
            Code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., NANCY"
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-sm text-gray-300">
            Name/Label
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional label"
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-2 py-1.5 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={create}
              disabled={creating || !code.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#CCFF00] text-black text-sm font-semibold disabled:opacity-60"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-3">
        {loading && <div className="text-sm text-gray-400">Loading…</div>}
        {!loading && list.length === 0 && (
          <div className="text-sm text-gray-400">No referral codes yet. Create one above.</div>
        )}
        {!loading && list.map((r) => (
          <div key={r.id} className="flex items-center justify-between border border-white/10 rounded-md p-3 bg-black/30">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{r.code}</span>
                {r.active ? (
                  <span className="text-xs text-green-400 inline-flex items-center gap-1"><Check className="w-3 h-3"/>Active</span>
                ) : (
                  <span className="text-xs text-red-400 inline-flex items-center gap-1"><X className="w-3 h-3"/>Inactive</span>
                )}
              </div>
              <div className="text-xs text-gray-400">{r.name || "—"}</div>
              <div className="text-xs text-gray-400">Clicks: {r.clicks ?? 0}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyLink(r.code)}
                className="px-2 py-1.5 text-xs rounded bg-white/5 border border-white/10 inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy link
              </button>
              <button
                onClick={() => toggle(r.id, !r.active)}
                className="px-2 py-1.5 text-xs rounded bg-white/5 border border-white/10"
              >
                {r.active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => remove(r.id)}
                className="px-2 py-1.5 text-xs rounded bg-white/5 border border-white/10 text-red-400"
              >
                Delete
              </button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
