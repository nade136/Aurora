"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Image from "next/image";

export default function MediaLibraryPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [items, setItems] = useState<{ name: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.storage.from("media").list(undefined, { sortBy: { column: "created_at", order: "desc" }, limit: 1000 });
    if (error) { console.error(error); return; }
    setItems((data || []).map((d) => ({ name: d.name, path: d.name })));
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(fileName, file, { upsert: false });
    setUploading(false);
    if (error) { console.error(error); return; }
    await load();
  };

  const getPublicUrl = (path: string) => supabase.storage.from("media").getPublicUrl(path).data.publicUrl;

  const remove = async (path: string) => {
    const { error } = await supabase.storage.from("media").remove([path]);
    if (error) { console.error(error); return; }
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Media Library</h1>
        <label className="text-xs font-semibold text-black bg-[#CCFF00] hover:bg-[#b8e600] px-3 py-1.5 rounded-md transition cursor-pointer">
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((it) => {
          const url = getPublicUrl(it.path);
          return (
            <div key={it.path} className="group relative aspect-square rounded-md bg-white/5 border border-white/10 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={it.name} className="w-full h-full object-cover" />
              <button onClick={()=>remove(it.path)} className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 border border-white/10 opacity-0 group-hover:opacity-100 transition">Delete</button>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-sm text-gray-400">No media yet. Upload an image.</div>
        )}
      </div>
      <div className="text-xs text-gray-500">Note: Create a public Storage bucket named <b>media</b> in Supabase.</div>
    </div>
  );
}
