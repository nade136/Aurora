"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Image from "next/image";

export default function MediaPicker({ 
  open, 
  onClose, 
  onSelect, 
  accept = '*' 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSelect: (path: string) => void;
  accept?: string;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [items, setItems] = useState<{ name: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");

  const loadMedia = useCallback(async () => {
    const { data, error } = await supabase.storage.from("media").list(undefined, { limit: 1000 });
    if (!error && data) {
      return data.map((d) => ({ name: d.name, path: d.name }));
    }
    return [];
  }, [supabase]);

  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    
    const load = async () => {
      const mediaItems = await loadMedia();
      if (isMounted) {
        setItems(mediaItems);
      }
    };
    
    load();
    
    return () => {
      isMounted = false;
    };
  }, [open, loadMedia]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(fileName, file);
      
      if (!error) {
        const mediaItems = await loadMedia();
        setItems(mediaItems);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter((it) => it.name.toLowerCase().includes(query.toLowerCase()));
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Choose media</div>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Close</button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2 text-sm" />
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-medium">Media Library</h3>
            <div>
              <label className="px-3 py-1.5 text-sm rounded-md bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer">
                {uploading ? "Uploading..." : "Upload"}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={onUpload} 
                  accept={accept}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[60vh] overflow-auto">
          {filtered.map((it) => (
            <button key={it.path} onClick={()=>{ onSelect(it.path); onClose(); }} className="aspect-square rounded-md bg-white/5 border border-white/10 overflow-hidden hover:ring-2 hover:ring-[#CCFF00]">
              <Image 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${it.path}`} 
                alt={it.name} 
                width={200}
                height={200}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-400">No media found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
