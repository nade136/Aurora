"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { HomeContent } from "@/lib/schemas/home";
import { defaultHomeContent, defaultGenericContent } from "@/lib/schemas/home";
import MediaPicker from "@/components/admin/MediaPicker";

// Helper function to safely update nested state
const updateNestedState = <T extends Record<string, any>>(
  obj: T,
  path: string[],
  value: any
): T => {
  if (path.length === 0) return value;
  const [current, ...rest] = path;
  return {
    ...obj,
    [current]: updateNestedState(obj[current] || {}, rest, value),
  };
};

export default function AdminHomeEditor() {
  const routeParams = useParams();
  const slug = typeof routeParams?.slug === 'string' 
    ? routeParams.slug 
    : Array.isArray(routeParams?.slug) 
      ? routeParams.slug[0] 
      : 'home';

  const supabase = useMemo(() => supabaseBrowser(), []);
  const baseDefault: HomeContent = slug === 'home' ? defaultHomeContent : defaultGenericContent;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [content, setContent] = useState<HomeContent>(baseDefault);
  const [pickTarget, setPickTarget] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Live Preview-only placeholder count for Workshop cohorts (does not affect saved content)
  const [previewCount, setPreviewCount] = useState<number>(3);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown support for Workshop preview
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const targetISO = content.workshop?.whoItsFor?.countdownTargetISO;
  const diffMs = targetISO ? Math.max(0, new Date(targetISO).getTime() - now) : 0;
  const hrs = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  const secs = Math.floor((diffMs % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  // Helpers for human-friendly datetime input
  const toLocalInputValue = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = p(d.getMonth() + 1);
    const day = p(d.getDate());
    const h = d.getHours();
    const min = d.getMinutes();
    return `${y}-${m}-${day}T${p(h)}:${p(min)}`;
  };

  // Refs to wire preview clicks -> inputs
  const tRefs = useRef({
    title: null as HTMLInputElement | null,
    subtitle: null as HTMLInputElement | null,
    leadQuote: null as HTMLTextAreaElement | null,
    heroVideo: null as HTMLInputElement | null,
    heroPoster: null as HTMLInputElement | null,
    heroImage: null as HTMLInputElement | null,
    items: [] as Array<{ name: HTMLInputElement | null; role: HTMLInputElement | null; text: HTMLTextAreaElement | null }>,
  });


  // Refs for dedicated WorkshopPage cohorts (click preview -> focus input)
  const wpRefs = useRef({
    badge: [] as Array<HTMLInputElement | null>,
    title: [] as Array<HTMLInputElement | null>,
    description: [] as Array<HTMLTextAreaElement | null>,
    fee: [] as Array<HTMLInputElement | null>,
    date: [] as Array<HTMLInputElement | null>,
    img: [] as Array<HTMLInputElement | null>,
    participants: [] as Array<HTMLInputElement | null>,
    avatar0: [] as Array<HTMLInputElement | null>,
    avatar1: [] as Array<HTMLInputElement | null>,
    avatar2: [] as Array<HTMLInputElement | null>,
  });

  // Safe assign helper for wpRefs arrays
  const setWpRef = (key: 'participants' | 'avatar0' | 'avatar1' | 'avatar2', index: number, el: HTMLInputElement | null) => {
    const bucket = (wpRefs.current as any)[key] as Array<HTMLInputElement | null> | undefined;
    if (!bucket) {
      (wpRefs.current as any)[key] = [];
    }
    const arr = (wpRefs.current as any)[key] as Array<HTMLInputElement | null>;
    while (arr.length <= index) arr.push(null);
    arr[index] = el;
  };

  // Refs for WorkshopPage header inputs
  const wpHeaderRefs = useRef({
    title: null as HTMLInputElement | null,
    subtitle: null as HTMLTextAreaElement | null,
  });

  // What We Do refs for click-to-focus
  const wwRefs = useRef({
    title: null as HTMLInputElement | null,
    subtitle: null as HTMLInputElement | null,
    items: [] as Array<{ title: HTMLInputElement | null; text: HTMLTextAreaElement | null; ctaLabel: HTMLInputElement | null; ctaUrl: HTMLInputElement | null }>,
  });

  // Workshop refs for click-to-focus
  const wRefs = useRef({
    title: null as HTMLInputElement | null,
    subtitle: null as HTMLInputElement | null,
    leftTitle: null as HTMLInputElement | null,
    leftText: null as HTMLTextAreaElement | null,
    rightTitle: null as HTMLInputElement | null,
    rightText: null as HTMLTextAreaElement | null,
    handsTitle: null as HTMLInputElement | null,
    handsText: null as HTMLTextAreaElement | null,
    careerTitle: null as HTMLInputElement | null,
    careerText: null as HTMLTextAreaElement | null,
    ctaLabel: null as HTMLInputElement | null,
    ctaUrl: null as HTMLInputElement | null,
    priceLabel: null as HTMLInputElement | null,
    countdownLabel: null as HTMLInputElement | null,
    countdownISO: null as HTMLInputElement | null,
    bullets: [] as Array<HTMLInputElement | null>,
    leftMedia: null as HTMLInputElement | null,
    rightMedia: null as HTMLInputElement | null,
    handsMedia: null as HTMLInputElement | null,
    careerMedia: null as HTMLInputElement | null,
  });

  const focusRef = (el?: HTMLElement | null) => {
    if (!el) return;
    el.focus();
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
  };
  const focusWorkshopBullet = (index: number) => {
    const current = content.workshop?.whoItsFor?.bullets || [];
    if (current[index] != null) {
      focusRef(wRefs.current.bullets[index] as unknown as HTMLElement);
      return;
    }
    const next = [...current];
    while (next.length <= index) next.push('');
    handleNestedChange(['workshop','whoItsFor','bullets'], next);
    setTimeout(() => focusRef(wRefs.current.bullets[index] as unknown as HTMLElement), 0);
  };

  
  const focusItem = (index: number, field: 'name' | 'role' | 'text') => {
    const r = tRefs.current.items[index]?.[field];
    focusRef(r as unknown as HTMLElement);
  };

  // Ensure What We Do item exists and focus a field
  const focusWhatItem = (index: number, field: 'title' | 'text' | 'ctaLabel' | 'ctaUrl' = 'title') => {
    const current = content.whatWeDo?.items || [];
    if (current[index]) {
      const r = wwRefs.current.items[index]?.[field === 'title' ? 'title' : field === 'text' ? 'text' : field === 'ctaLabel' ? 'ctaLabel' : 'ctaUrl'];
      focusRef(r as unknown as HTMLElement);
      return;
    }
    const filler = { title: 'Service Title', text: 'Description', cta: { label: 'Action', url: '#' } };
    const next = [...current];
    while (next.length <= index) next.push({ ...filler });
    handleNestedChange(['whatWeDo','items'], next);
    setTimeout(() => {
      const r = wwRefs.current.items[index]?.[field === 'title' ? 'title' : field === 'text' ? 'text' : field === 'ctaLabel' ? 'ctaLabel' : 'ctaUrl'];
      focusRef(r as unknown as HTMLElement);
    }, 0);
  };

  const focusOrCreateItem = (index: number, field: 'name' | 'role' | 'text' = 'name') => {
    const current = content.testimonials?.items || [];
    if (current[index]) {
      focusItem(index, field);
      return;
    }
    const filler = { name: '', role: '', text: '', avatar: '' };
    const next = [...current];
    while (next.length <= index) next.push({ ...filler });
    handleNestedChange(['testimonials', 'items'], next);
    // Focus after state update and refs set
    setTimeout(() => focusItem(index, field), 0);
  };

  // Load page content
  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        const { data: page } = await supabase
          .from("pages")
          .select("id, content_json")
          .eq("slug", slug)
          .maybeSingle();

        if (!page) {
          // Create page if it doesn't exist
          const safeTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
          const { data: newPage } = await supabase
            .from('pages')
            .insert({
              slug,
              title: safeTitle,
              content_json: baseDefault,
              status: 'draft',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id, content_json')
            .single();
            
          if (newPage?.content_json) {
            setContent(newPage.content_json as HomeContent);
          } else {
            setContent(baseDefault);
          }
        } else {
          // Ensure we never set content to null; fallback to defaults if empty
          setContent((page.content_json || baseDefault) as HomeContent);
        }
      } catch (error) {
        console.error('Error loading page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, supabase]);

  // Handle saving draft
  const saveDraft = async () => {
    if (!slug) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pages')
        .upsert(
          {
            slug,
            title: slug.charAt(0).toUpperCase() + slug.slice(1),
            content_json: content,
            status: 'draft',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'slug' }
        );
      if (error) {
        console.error('Error saving draft (RLS/env?):', error);
        alert(`Save failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle publishing
  const publish = async () => {
    if (!slug) return;
    
    setPublishing(true);
    try {
      const { error } = await supabase
        .from('pages')
        .upsert(
          {
            slug,
            title: slug.charAt(0).toUpperCase() + slug.slice(1),
            content_json: content,
            status: 'published',
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'slug' }
        );
      if (error) {
        console.error('Error publishing (RLS/env?):', error);
        alert(`Publish failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setPublishing(false);
    }
  };

  // Handle file upload
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  // Handle nested changes
  const handleNestedChange = (path: (keyof HomeContent | string)[], value: any) => {
    setContent((prev) => {
      const [first, ...rest] = path;
      if (!first) return prev;
      if (rest.length === 0) {
        return { ...(prev as any), [first as string]: value } as HomeContent;
      }
      const updated = updateNestedState((prev as any)[first as string] || {}, rest as string[], value);
      return { ...(prev as any), [first as string]: updated } as HomeContent;
    });
  };

  // Handle file upload for a specific field
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string[]) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await uploadFile(file, 'uploads');
      handleNestedChange(path, url);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Open media picker
  const openPicker = (path: string) => {
    setPickTarget(path);
    setPickerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (slug !== 'home' && slug !== 'workshop') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit {slug.charAt(0).toUpperCase() + slug.slice(1)} Page</h1>
            <div />
          </div>
        </header>
        <main className="space-y-12"></main>
      </div>
    );
  }

  // Full editor for Workshop page (mirrors /workshop)
  if (slug === 'workshop') {
    const cohorts = (content as any)?.workshopPage?.cohorts || [];
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Workshop Page</h1>
            <div className="flex space-x-4">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={publish}
                disabled={publishing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor panel */}
          <div className="space-y-6">
            <section className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Page Header</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={(content as any)?.workshopPage?.title || ''}
                    onChange={(e) => handleNestedChange(['workshopPage','title'], e.target.value)}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    placeholder="WORKSHOP"
                    ref={(el) => { wpHeaderRefs.current.title = el; }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <textarea
                    value={(content as any)?.workshopPage?.subtitle || ''}
                    onChange={(e) => handleNestedChange(['workshopPage','subtitle'], e.target.value)}
                    className="w-full bg-gray-700 rounded px-3 py-2 h-24"
                    placeholder="Hands-on robotics courses..."
                    ref={(el) => { wpHeaderRefs.current.subtitle = el as HTMLTextAreaElement | null; }}
                  />
                </div>
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Cohorts <span className="text-sm text-gray-400">({cohorts.length})</span></h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...cohorts];
                      next.push({ id: Date.now(), badge: '', img: '', title: '', description: '', fee: '', date: '' });
                      handleNestedChange(['workshopPage','cohorts'], next);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >+ Add Cohort</button>
                  <button
                    type="button"
                    onClick={() => handleNestedChange(['workshopPage','cohorts'], [])}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                  >Clear All</button>
                </div>
              </div>

              <div className="space-y-4">
                {cohorts.map((c: any, idx: number) => (
                  <div key={c.id ?? idx} className="bg-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Cohort {idx + 1}</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                          onClick={() => {
                            const next = [...cohorts];
                            if (idx > 0) {
                              const tmp = next[idx-1];
                              next[idx-1] = next[idx];
                              next[idx] = tmp;
                              handleNestedChange(['workshopPage','cohorts'], next);
                            }
                          }}
                        >Move Up</button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                          onClick={() => {
                            const next = [...cohorts];
                            if (idx < next.length - 1) {
                              const tmp = next[idx+1];
                              next[idx+1] = next[idx];
                              next[idx] = tmp;
                              handleNestedChange(['workshopPage','cohorts'], next);
                            }
                          }}
                        >Move Down</button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded"
                          onClick={() => {
                            const next = [...cohorts];
                            next.splice(idx, 1);
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                        >Remove</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Badge</label>
                        <input
                          type="text"
                          value={c.badge || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], badge: e.target.value };
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => { wpRefs.current.badge[idx] = el; }}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="e.g., ONGOING"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Title</label>
                        <input
                          type="text"
                          value={c.title || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], title: e.target.value };
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => { wpRefs.current.title[idx] = el; }}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="Aurora Core Workshop (Cohort X)"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1">Description</label>
                        <textarea
                          value={c.description || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], description: e.target.value };
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => { wpRefs.current.description[idx] = el as HTMLTextAreaElement | null; }}
                          className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                          placeholder="Short program description"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Fee</label>
                        <input
                          type="text"
                          value={c.fee || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], fee: e.target.value };
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => { wpRefs.current.fee[idx] = el; }}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="$32 USD / 50,000 NGN"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Participants Count</label>
                        <input
                          type="number"
                          value={typeof c.participantsCount === 'number' ? c.participantsCount : ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            const raw = e.target.value;
                            next[idx] = { ...next[idx], participantsCount: raw === '' ? undefined : Number(raw) } as any;
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => setWpRef('participants', idx, el)}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="e.g., 70"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Date</label>
                        <input
                          type="text"
                          value={c.date || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], date: e.target.value };
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          ref={(el) => { wpRefs.current.date[idx] = el; }}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="MARCH 2026 to APRIL 2026"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Enable Button</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!c.ctaEnabled}
                            onChange={(e) => {
                              const next = [...cohorts];
                              next[idx] = { ...next[idx], ctaEnabled: e.target.checked } as any;
                              handleNestedChange(['workshopPage','cohorts'], next);
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-300">Allow registering</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Button URL</label>
                        <input
                          type="text"
                          value={c.ctaUrl || ''}
                          onChange={(e) => {
                            const next = [...cohorts];
                            next[idx] = { ...next[idx], ctaUrl: e.target.value } as any;
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                          className="w-full bg-gray-600 rounded px-3 py-2"
                          placeholder="/book-slot?cohort=core-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1">Image</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={c.img || ''}
                            onChange={(e) => {
                              const next = [...cohorts];
                              next[idx] = { ...next[idx], img: e.target.value };
                              handleNestedChange(['workshopPage','cohorts'], next);
                            }}
                            ref={(el) => { wpRefs.current.img[idx] = el; }}
                            className="flex-1 min-w-0 bg-gray-600 rounded px-3 py-2"
                            placeholder="https://.../image.jpg"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id={`cohort-img-${idx}`}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const url = await uploadFile(file, 'workshop/cohorts');
                                const next = [...cohorts];
                                next[idx] = { ...next[idx], img: url };
                                handleNestedChange(['workshopPage','cohorts'], next);
                              } catch (err) {
                                console.error('upload error', err);
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor={`cohort-img-${idx}`} className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded cursor-pointer text-sm">Upload</label>
                        </div>
                        {c.img && (
                          <div className="mt-2 h-24 w-full overflow-hidden rounded border border-white/10">
                            <img src={c.img} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-300 mb-2">Participant Avatars (up to 3)</label>
                        {[0,1,2].map((k) => (
                          <div key={k} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={(c.avatars?.[k]) || ''}
                              onChange={(e) => {
                                const next = [...cohorts];
                                const arr = [...(next[idx].avatars || [])];
                                arr[k] = e.target.value;
                                next[idx] = { ...next[idx], avatars: arr } as any;
                                handleNestedChange(['workshopPage','cohorts'], next);
                              }}
                              ref={(el) => setWpRef(k===0? 'avatar0' : k===1? 'avatar1' : 'avatar2', idx, el)}
                              className="flex-1 min-w-0 bg-gray-600 rounded px-3 py-2"
                              placeholder={`Avatar ${k+1} URL`}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              id={`cohort-avatar-${idx}-${k}`}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const url = await uploadFile(file, 'workshop/cohorts/avatars');
                                  const next = [...cohorts];
                                  const arr = [...(next[idx].avatars || [])];
                                  arr[k] = url;
                                  next[idx] = { ...next[idx], avatars: arr } as any;
                                  handleNestedChange(['workshopPage','cohorts'], next);
                                } catch (err) {
                                  console.error('upload error', err);
                                }
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`cohort-avatar-${idx}-${k}`} className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded cursor-pointer text-sm">Upload</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Live Preview */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Live Preview{' '}
                <span className="text-sm text-gray-400">
                  (Real: {cohorts.length} | Preview: {Math.max(0, previewCount - cohorts.length)} | Total: {Math.max(cohorts.length, previewCount)})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  onClick={() => setPreviewCount((n) => n + 1)}
                >Add Preview Div</button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm disabled:opacity-50"
                  onClick={() => setPreviewCount((n) => Math.max(0, n - 1))}
                  disabled={previewCount <= 0}
                >Remove Preview Div</button>
              </div>
            </div>
            <div className="max-w-4xl mx-auto text-center mb-10">
              <h1 className="text-white font-bold text-4xl mb-3 tracking-wider cursor-pointer" onClick={() => focusRef(wpHeaderRefs.current.title as unknown as HTMLElement)}>{(content as any)?.workshopPage?.title || 'WORKSHOP'}</h1>
              {(content as any)?.workshopPage?.subtitle && (
                <p className="text-gray-300 cursor-pointer" onClick={() => focusRef(wpHeaderRefs.current.subtitle as unknown as HTMLElement)}>{(content as any).workshopPage.subtitle}</p>
              )}
            </div>
            {!mounted ? (
              <div className="text-sm text-gray-400">Loading preview…</div>
            ) : (() => {
              const list = [...cohorts];
              // Fill preview-only placeholders up to previewCount
              const fillersNeeded = Math.max(0, previewCount - list.length);
              for (let j = 0; j < fillersNeeded; j++) {
                const i = list.length;
                list.push({
                  id: i,
                  badge: i === 0 ? 'ONGOING' : 'UPCOMING',
                  img: '',
                  title: i === 0 ? 'Aurora Core Workshop (Cohort 2)' : i === 1 ? 'Aurora Core Workshop (Cohort 3)' : 'Aurora Core Workshop (Cohort 4)',
                  description: 'Short program description',
                  fee: '$32 USD / 50,000 NGN',
                  date: i === 0 ? 'MARCH 2026 to APRIL 2026' : 'MAY 2026 to JUNE 2026'
                });
              }
              const previewCohorts = list;
              return (
            <div className="space-y-8">
              {previewCohorts.map((c: any, i: number) => (
                <div key={c.id ?? i} id={`preview-cohort-${c.id ?? i}`} className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#0b0b0b]">
                  {/* Per-card controls */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {i < cohorts.length && (
                      <>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded"
                          onClick={() => {
                            const next = [...cohorts];
                            const [item] = next.splice(i, 1);
                            next.unshift(item);
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                        >Make First</button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded"
                          onClick={() => {
                            const next = [...cohorts];
                            next.splice(i, 1);
                            handleNestedChange(['workshopPage','cohorts'], next);
                          }}
                        >Remove</button>
                      </>
                    )}
                  </div>
                  <div className="relative" onClick={() => { const input = document.getElementById(`cohort-img-${i}`) as HTMLInputElement | null; if (input) input.click(); else focusRef(wpRefs.current.img[i] as unknown as HTMLElement); }}>
                    {c.img ? (
                      <img src={c.img} alt={c.title || 'Program'} className="w-full h-auto block" />
                    ) : (
                      <div className="w-full aspect-[16/9] bg-gray-700 flex items-center justify-center text-gray-400">Program Image Placeholder</div>
                    )}
                    {c.badge && (
                      <div className="absolute top-6 right-6 bg-white text-black text-xs md:text-sm font-semibold px-4 py-2 rounded-xl shadow cursor-pointer" onClick={(e) => { e.stopPropagation(); focusRef(wpRefs.current.badge[i] as unknown as HTMLElement); }}>{c.badge}</div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 cursor-pointer" onClick={() => focusRef(wpRefs.current.title[i] as unknown as HTMLElement)}>{c.title || 'Workshop Title'}</h3>
                    <p className="text-gray-300 cursor-pointer" onClick={() => focusRef(wpRefs.current.description[i] as unknown as HTMLElement)}>{c.description || 'Short description goes here.'}</p>
                    {c.date && (
                      <div className="mt-2 text-sm text-gray-400 cursor-pointer" onClick={() => focusRef(wpRefs.current.date[i] as unknown as HTMLElement)}>{c.date}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Participants</div>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3">
                            {[0,1,2].map((k) => (
                              c.avatars?.[k] ? (
                                <img
                                  key={k}
                                  src={c.avatars[k]}
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-black cursor-pointer"
                                  onClick={() => focusRef((k===0? wpRefs.current.avatar0 : k===1? wpRefs.current.avatar1 : wpRefs.current.avatar2)[i] as unknown as HTMLElement)}
                                />
                              ) : (
                                <div key={k} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-black cursor-pointer" onClick={() => { const input = document.getElementById(`cohort-avatar-${i}-${k}`) as HTMLInputElement | null; if (input) input.click(); else focusRef((k===0? wpRefs.current.avatar0 : k===1? wpRefs.current.avatar1 : wpRefs.current.avatar2)[i] as unknown as HTMLElement); }} />
                              )
                            ))}
                          </div>
                          <span className="bg-[#C6FF00] text-black text-xs font-semibold px-3 py-1 rounded-md cursor-pointer" onClick={() => focusRef(wpRefs.current.participants[i] as unknown as HTMLElement)}>+ {(typeof c.participantsCount === 'number' ? c.participantsCount : 70)} Students</span>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <div className="text-gray-400 text-sm mb-1">Registration Fee</div>
                        <div className="text-2xl md:text-3xl font-bold cursor-pointer" onClick={() => focusRef(wpRefs.current.fee[i] as unknown as HTMLElement)}>{c.fee || '$0'}</div>
                      </div>
                    </div>
                    <div className="mt-8">
                      {c.ctaEnabled ? (
                        <a href={c.ctaUrl || '#'} className="block w-full">
                          <button className="w-full bg-[#C6FF00] hover:bg-[#b8e600] text-black font-bold text-lg md:text-xl py-4 md:py-5 rounded-2xl shadow-lg shadow-[#C6FF00]/20" onClick={(e) => { /* keep focus helper */ focusRef(wpRefs.current.title[i] as unknown as HTMLElement); }}>
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
              ))}
            </div>
              )
            })()}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-x-hidden">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Edit {slug.charAt(0).toUpperCase() + slug.slice(1)} Page
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-12">
        {/* Hero Section */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.hero?.heading || ''}
                onChange={(e) => handleNestedChange(['hero', 'heading'], e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <textarea
                value={content.hero?.subtext || ''}
                onChange={(e) => handleNestedChange(['hero', 'subtext'], e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Media (image/video src)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e, ['hero', 'background', 'src'])}
                className="w-full bg-gray-700 rounded px-3 py-2"
              />
              {content.hero?.background?.src && (
                <div className="mt-2">
                  <img 
                    src={content.hero.background.src} 
                    alt="Preview" 
                    className="h-32 w-auto object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What We Do (Services)</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={content.whatWeDo?.title || ''}
                  onChange={(e) => handleNestedChange(['whatWeDo','title'], e.target.value)}
                  ref={(el) => { wwRefs.current.title = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={content.whatWeDo?.subtitle || ''}
                  onChange={(e) => handleNestedChange(['whatWeDo','subtitle'], e.target.value)}
                  ref={(el) => { wwRefs.current.subtitle = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Items Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Service Items</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    onClick={() => {
                      const items = content.whatWeDo?.items || [];
                      if (items.length >= 5) return;
                      handleNestedChange(['whatWeDo','items'], [...items, { title: '', text: '', cta: { label: '', url: '' } }]);
                    }}
                  >+ Add Item</button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                    onClick={() => handleNestedChange(['whatWeDo','items'], [])}
                  >Clear All</button>
                </div>
              </div>

              {(content.whatWeDo?.items || []).map((it, idx) => (
                <div key={idx} className="bg-gray-700 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {idx + 1}</h4>
                    <button
                      type="button"
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                      onClick={() => {
                        const items = [...(content.whatWeDo?.items || [])];
                        if (idx < items.length) items.splice(idx, 1);
                        handleNestedChange(['whatWeDo','items'], items);
                      }}
                    >Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={it?.title || ''}
                      onChange={(e) => {
                        const items = [...(content.whatWeDo?.items || [])];
                        if (!items[idx]) items[idx] = { title: '', text: '', cta: { label: '', url: '' } } as any;
                        items[idx] = { ...(items[idx] || {}), title: e.target.value } as any;
                        handleNestedChange(['whatWeDo','items'], items);
                      }}
                      ref={(el) => { if (!wwRefs.current.items[idx]) wwRefs.current.items[idx] = { title: null, text: null, ctaLabel: null, ctaUrl: null }; wwRefs.current.items[idx].title = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={it?.cta?.label || ''}
                      onChange={(e) => {
                        const items = [...(content.whatWeDo?.items || [])];
                        const prev = items[idx] || { title: '', text: '', cta: { label: '', url: '' } };
                        items[idx] = { ...prev, cta: { ...(prev.cta || { label: '', url: '' }), label: e.target.value } } as any;
                        handleNestedChange(['whatWeDo','items'], items);
                      }}
                      ref={(el) => { if (!wwRefs.current.items[idx]) wwRefs.current.items[idx] = { title: null, text: null, ctaLabel: null, ctaUrl: null }; wwRefs.current.items[idx].ctaLabel = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="CTA Label"
                    />
                  </div>
                  <textarea
                    value={it?.text || ''}
                    onChange={(e) => {
                      const items = [...(content.whatWeDo?.items || [])];
                      if (!items[idx]) items[idx] = { title: '', text: '', cta: { label: '', url: '' } } as any;
                      items[idx] = { ...(items[idx] || {}), text: e.target.value } as any;
                      handleNestedChange(['whatWeDo','items'], items);
                    }}
                    ref={(el) => { if (!wwRefs.current.items[idx]) wwRefs.current.items[idx] = { title: null, text: null, ctaLabel: null, ctaUrl: null }; wwRefs.current.items[idx].text = el as unknown as HTMLTextAreaElement; }}
                    className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={it?.cta?.url || ''}
                    onChange={(e) => {
                      const items = [...(content.whatWeDo?.items || [])];
                      const prev = items[idx] || { title: '', text: '', cta: { label: '', url: '' } };
                      items[idx] = { ...prev, cta: { ...(prev.cta || { label: '', url: '' }), url: e.target.value } } as any;
                      handleNestedChange(['whatWeDo','items'], items);
                    }}
                    ref={(el) => { if (!wwRefs.current.items[idx]) wwRefs.current.items[idx] = { title: null, text: null, ctaLabel: null, ctaUrl: null }; wwRefs.current.items[idx].ctaUrl = el; }}
                    className="w-full bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA URL"
                  />
                </div>
              ))}
            </div>

            {/* Preview (mirrors homepage WhatWeDo) */}
            <div className="relative border border-white/10 rounded-xl p-6 bg-black/30 overflow-x-auto max-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-12">
                {/* Left Header */}
                <div className="lg:col-span-4">
                  <div className="inline-block px-4 py-1.5 border border-[#CCFF00] rounded-full mb-4 text-[#CCFF00] text-xs">SERVICES</div>
                  <div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold cursor-pointer mb-3 sm:mb-4" onClick={() => focusRef(wwRefs.current.title)}>{content.whatWeDo?.title || 'WHAT WE DO'}</div>
                    <div className="text-gray-400 text-sm sm:text-base cursor-pointer" onClick={() => focusRef(wwRefs.current.subtitle)}>{content.whatWeDo?.subtitle || 'At Aurora, we speak one language - Engineering'}</div>
                  </div>
                </div>
                {/* Right First Two Cards */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {(() => {
                      const defaults = [
                        { title: 'Education', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                        { title: 'Hardware', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Schedule A Meeting', url: '#' } },
                        { title: 'Robotics Software', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                        { title: 'Consultation', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Schedule A Meeting', url: '#' } },
                        { title: 'Firmware', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                      ];
                      const src = content.whatWeDo?.items || [];
                      const merged = defaults.map((d, i) => ({ ...d, ...(src[i] || {}) }));
                      return merged.slice(0,2);
                    })().map((it, i) => (
                      <div key={i} className="relative group">
                        {/* SVG Border with diagonal cut at bottom-right */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          preserveAspectRatio="none"
                          viewBox="0 0 400 300"
                        >
                          <path
                            d="M 2,2 L 398,2 L 398,260 L 360,298 L 2,298 Z"
                            fill="none"
                            stroke="rgb(39, 39, 42)"
                            strokeWidth="2"
                          />
                        </svg>

                        {/* Card Content */}
                        <div className="relative p-6 sm:p-8 flex flex-col h-full min-h-[240px] sm:min-h-[280px]">
                          <div className="text-xl font-bold mb-2 cursor-pointer" onClick={() => focusWhatItem(i,'title')}>{it?.title || 'Service Title'}</div>
                          <p className="text-gray-300 text-sm mb-6 cursor-pointer grow" onClick={() => focusWhatItem(i,'text')}>{it?.text || 'Description'}</p>
                          <a href={it?.cta?.url || '#'} className="inline-flex items-center gap-2 text-[#CCFF00] font-semibold text-sm cursor-pointer" onClick={(e) => { e.preventDefault(); focusWhatItem(i,'ctaLabel'); }}>
                            <span>{it?.cta?.label || 'Action'}</span>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#CCFF00]"><span className="w-1.5 h-1.5 rounded-full bg-black" /></span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom three */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(() => {
                  const defaults = [
                    { title: 'Education', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                    { title: 'Hardware', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Schedule A Meeting', url: '#' } },
                    { title: 'Robotics Software', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                    { title: 'Consultation', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Schedule A Meeting', url: '#' } },
                    { title: 'Firmware', text: 'Lorem ipsum dolor sit amet. Ad molestiae adipisci ut velit corrupti et unde magnam Quo eaque enim et aliquid consectetur ab optio voluptas.', cta: { label: 'Register Now', url: '#' } },
                  ];
                  const src = content.whatWeDo?.items || [];
                  const merged = defaults.map((d, i) => ({ ...d, ...(src[i] || {}) }));
                  return merged.slice(2,5);
                })().map((it, i) => (
                  <div key={i} className="relative group">
                    {/* SVG Border with diagonal cut at bottom-right */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                      viewBox="0 0 400 300"
                    >
                      <path
                        d="M 2,2 L 398,2 L 398,260 L 360,298 L 2,298 Z"
                        fill="none"
                        stroke="rgb(39, 39, 42)"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Card Content */}
                    <div className="relative p-8 flex flex-col h-full min-h-[280px]">
                      <div className="text-xl font-bold mb-2 cursor-pointer" onClick={() => focusWhatItem(i+2,'title')}>{it?.title || 'Service Title'}</div>
                      <p className="text-gray-300 text-sm mb-6 cursor-pointer grow" onClick={() => focusWhatItem(i+2,'text')}>{it?.text || 'Description'}</p>
                      <a href={it?.cta?.url || '#'} className="inline-flex items-center gap-2 text-[#CCFF00] font-semibold text-sm cursor-pointer" onClick={(e) => { e.preventDefault(); focusWhatItem(i+2,'ctaLabel'); }}>
                        <span>{it?.cta?.label || 'Action'}</span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#CCFF00]"><span className="w-1.5 h-1.5 rounded-full bg-black" /></span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Who It's For (Workshop)</h2>
          <div className="space-y-6">
            {/* Bullets */}
            <div>
              <h3 className="text-lg font-medium mb-2">Bullet Points</h3>
              <div className="space-y-2">
                {(content.workshop?.whoItsFor?.bullets || []).map((bullet, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const bullets = [...(content.workshop?.whoItsFor?.bullets || [])];
                        bullets[i] = e.target.value;
                        handleNestedChange(['workshop', 'whoItsFor', 'bullets'], bullets);
                      }}
                      ref={(el) => { wRefs.current.bullets[i] = el as unknown as HTMLInputElement | null; }}
                      className="flex-1 bg-gray-700 rounded px-3 py-2"
                      placeholder={`Bullet point ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const bullets = [...(content.workshop?.whoItsFor?.bullets || [])];
                        bullets.splice(i, 1);
                        handleNestedChange(['workshop', 'whoItsFor', 'bullets'], bullets);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const bullets = [...(content.workshop?.whoItsFor?.bullets || []), ''];
                    handleNestedChange(['workshop', 'whoItsFor', 'bullets'], bullets);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  + Add Bullet Point
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CTA Label</label>
                <input
                  type="text"
                  value={content.workshop?.whoItsFor?.cta?.label || ''}
                  onChange={(e) => handleNestedChange(['workshop', 'whoItsFor', 'cta', 'label'], e.target.value)}
                  ref={el => wRefs.current.ctaLabel = el}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="e.g., Register Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CTA URL</label>
                <input
                  type="text"
                  value={content.workshop?.whoItsFor?.cta?.url || ''}
                  onChange={(e) => handleNestedChange(['workshop', 'whoItsFor', 'cta', 'url'], e.target.value)}
                  ref={el => wRefs.current.ctaUrl = el}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="https://example.com/register"
                />
              </div>
            </div>

            {/* Price and Countdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price Label</label>
                <input
                  type="text"
                  value={content.workshop?.whoItsFor?.priceLabel || ''}
                  onChange={(e) => handleNestedChange(['workshop', 'whoItsFor', 'priceLabel'], e.target.value)}
                  ref={el => wRefs.current.priceLabel = el}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="e.g., Only $99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Countdown Label</label>
                <input
                  type="text"
                  value={content.workshop?.whoItsFor?.countdownLabel || ''}
                  onChange={(e) => handleNestedChange(['workshop', 'whoItsFor', 'countdownLabel'], e.target.value)}
                  ref={el => wRefs.current.countdownLabel = el}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  placeholder="e.g., Registration closes in"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Countdown Target (UTC)</label>
                <input
                  type="datetime-local"
                  value={content.workshop?.whoItsFor?.countdownTargetISO ? 
                    new Date(content.workshop.whoItsFor.countdownTargetISO).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    handleNestedChange(['workshop', 'whoItsFor', 'countdownTargetISO'], date.toISOString());
                  }}
                  ref={el => wRefs.current.countdownISO = el}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
                {content.workshop?.whoItsFor?.countdownTargetISO && (
                  <div className="text-xs text-gray-400 mt-1">
                    Time left: {String(hrs).padStart(2, '0')}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-3">Preview</h3>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Who is this for?</h4>
                <ul className="space-y-2 pl-5 list-disc">
                  {content.workshop?.whoItsFor?.bullets?.length ? (
                    content.workshop.whoItsFor.bullets.map((bullet, i) => (
                      <li key={i} className="text-gray-300">{bullet || `Bullet point ${i + 1}`}</li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No bullet points added yet</li>
                  )}
                </ul>
                
                {(content.workshop?.whoItsFor?.priceLabel || content.workshop?.whoItsFor?.countdownLabel) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap items-center gap-4">
                      {content.workshop?.whoItsFor?.priceLabel && (
                        <div className="px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-full">
                          {content.workshop.whoItsFor.priceLabel}
                        </div>
                      )}
                      {content.workshop?.whoItsFor?.countdownLabel && content.workshop?.whoItsFor?.countdownTargetISO && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{content.workshop.whoItsFor.countdownLabel}</span>
                          <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                            {String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {content.workshop?.whoItsFor?.cta?.label && (
                  <div className="mt-4">
                    <a
                      href={content.workshop.whoItsFor.cta.url || '#'}
                      className="inline-block px-6 py-2 bg-[#CCFF00] text-black font-semibold rounded-full hover:bg-yellow-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content.workshop.whoItsFor.cta.label}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Workshop Section */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Workshop (Homepage)</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={content.workshop?.title || ''}
                  onChange={(e) => handleNestedChange(['workshop','title'], e.target.value)}
                  ref={(el) => { wRefs.current.title = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={content.workshop?.subtitle || ''}
                  onChange={(e) => handleNestedChange(['workshop','subtitle'], e.target.value)}
                  ref={(el) => { wRefs.current.subtitle = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Bottom Summaries removed */}

            {/* Features Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Feature */}
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Left Feature (Curriculum)</h3>
                <input
                  type="text"
                  value={content.workshop?.leftFeature?.title || ''}
                  onChange={(e) => handleNestedChange(['workshop','leftFeature','title'], e.target.value)}
                  ref={(el) => { wRefs.current.leftTitle = el; }}
                  className="w-full bg-gray-600 rounded px-3 py-2"
                  placeholder="Title"
                />
                <textarea
                  value={content.workshop?.leftFeature?.text || ''}
                  onChange={(e) => handleNestedChange(['workshop','leftFeature','text'], e.target.value)}
                  ref={(el) => { wRefs.current.leftText = el as unknown as HTMLTextAreaElement; }}
                  className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Description or bullet lines"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Media</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      className="bg-gray-600 rounded px-3 py-2"
                      value={content.workshop?.leftFeature?.media?.kind || 'image'}
                      onChange={(e) => handleNestedChange(['workshop','leftFeature','media'], { ...(content.workshop?.leftFeature?.media || {}), kind: e.target.value })}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text"
                      value={content.workshop?.leftFeature?.media?.src || ''}
                      onChange={(e) => handleNestedChange(['workshop','leftFeature','media','src'], e.target.value)}
                      ref={(el) => { wRefs.current.leftMedia = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="Media URL"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm" onClick={() => openPicker('workshop.leftFeature.media.src')}>Browse</button>
                      <label className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer">
                        Upload
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const url = await uploadFile(file, 'workshop/leftFeature');
                          handleNestedChange(['workshop','leftFeature','media','src'], url);
                        }} />
                      </label>
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','leftFeature','media','src'], '')}
                      >Remove</button>
                    </div>
                  </div>
                  {content.workshop?.leftFeature?.media?.kind === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={content.workshop?.leftFeature?.media?.poster || ''}
                        onChange={(e) => handleNestedChange(['workshop','leftFeature','media','poster'], e.target.value)}
                        className="w-full bg-gray-600 rounded px-3 py-2 md:col-span-2"
                        placeholder="Poster URL (for video)"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','leftFeature','media','poster'], '')}
                      >Remove Poster</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={content.workshop?.leftFeature?.cta?.label || ''}
                    onChange={(e) => handleNestedChange(['workshop','leftFeature','cta','label'], e.target.value)}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA Label"
                  />
                  <input
                    type="text"
                    value={content.workshop?.leftFeature?.cta?.url || ''}
                    onChange={(e) => handleNestedChange(['workshop','leftFeature','cta','url'], e.target.value)}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA URL"
                  />
                </div>
              </div>

              {/* Right Feature */}
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Right Feature (Schedule)</h3>
                <input
                  type="text"
                  value={content.workshop?.rightFeature?.title || ''}
                  onChange={(e) => handleNestedChange(['workshop','rightFeature','title'], e.target.value)}
                  ref={(el) => { wRefs.current.rightTitle = el; }}
                  className="w-full bg-gray-600 rounded px-3 py-2"
                  placeholder="Title"
                />
                <textarea
                  value={content.workshop?.rightFeature?.text || ''}
                  onChange={(e) => handleNestedChange(['workshop','rightFeature','text'], e.target.value)}
                  ref={(el) => { wRefs.current.rightText = el as unknown as HTMLTextAreaElement; }}
                  className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Description or bullet lines"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Media</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      className="bg-gray-600 rounded px-3 py-2"
                      value={content.workshop?.rightFeature?.media?.kind || 'image'}
                      onChange={(e) => handleNestedChange(['workshop','rightFeature','media'], { ...(content.workshop?.rightFeature?.media || {}), kind: e.target.value })}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text"
                      value={content.workshop?.rightFeature?.media?.src || ''}
                      onChange={(e) => handleNestedChange(['workshop','rightFeature','media','src'], e.target.value)}
                      ref={(el) => { wRefs.current.rightMedia = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="Media URL"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm" onClick={() => openPicker('workshop.rightFeature.media.src')}>Browse</button>
                      <label className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer">
                        Upload
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const url = await uploadFile(file, 'workshop/rightFeature');
                          handleNestedChange(['workshop','rightFeature','media','src'], url);
                        }} />
                      </label>
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','rightFeature','media','src'], '')}
                      >Remove</button>
                    </div>
                  </div>
                  {content.workshop?.rightFeature?.media?.kind === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={content.workshop?.rightFeature?.media?.poster || ''}
                        onChange={(e) => handleNestedChange(['workshop','rightFeature','media','poster'], e.target.value)}
                        className="w-full bg-gray-600 rounded px-3 py-2 md:col-span-2"
                        placeholder="Poster URL (for video)"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','rightFeature','media','poster'], '')}
                      >Remove Poster</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={content.workshop?.rightFeature?.cta?.label || ''}
                    onChange={(e) => handleNestedChange(['workshop','rightFeature','cta','label'], e.target.value)}
                    ref={(el) => { wRefs.current.ctaLabel = el; }}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA Label"
                  />
                  <input
                    type="text"
                    value={content.workshop?.rightFeature?.cta?.url || ''}
                    onChange={(e) => handleNestedChange(['workshop','rightFeature','cta','url'], e.target.value)}
                    ref={(el) => { wRefs.current.ctaUrl = el; }}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA URL"
                  />
                </div>
              </div>

              {/* Outcomes/Career Growth */}
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Outcomes (Career Growth)</h3>
                <input
                  type="text"
                  value={content.workshop?.careerGrowth?.title || ''}
                  onChange={(e) => handleNestedChange(['workshop','careerGrowth','title'], e.target.value)}
                  ref={(el) => { wRefs.current.careerTitle = el; }}
                  className="w-full bg-gray-600 rounded px-3 py-2"
                  placeholder="Title"
                />
                <textarea
                  value={content.workshop?.careerGrowth?.text || ''}
                  onChange={(e) => handleNestedChange(['workshop','careerGrowth','text'], e.target.value)}
                  ref={(el) => { wRefs.current.careerText = el as unknown as HTMLTextAreaElement; }}
                  className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Description or bullet lines"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Media</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      className="bg-gray-600 rounded px-3 py-2"
                      value={content.workshop?.careerGrowth?.media?.kind || 'image'}
                      onChange={(e) => handleNestedChange(['workshop','careerGrowth','media'], { ...(content.workshop?.careerGrowth?.media || {}), kind: e.target.value })}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text"
                      value={content.workshop?.careerGrowth?.media?.src || ''}
                      onChange={(e) => handleNestedChange(['workshop','careerGrowth','media','src'], e.target.value)}
                      ref={(el) => { wRefs.current.careerMedia = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="Media URL"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm" onClick={() => openPicker('workshop.careerGrowth.media.src')}>Browse</button>
                      <label className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer">
                        Upload
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const url = await uploadFile(file, 'workshop/careerGrowth');
                          handleNestedChange(['workshop','careerGrowth','media','src'], url);
                        }} />
                      </label>
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','careerGrowth','media','src'], '')}
                      >Remove</button>
                    </div>
                  </div>
                  {content.workshop?.careerGrowth?.media?.kind === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={content.workshop?.careerGrowth?.media?.poster || ''}
                        onChange={(e) => handleNestedChange(['workshop','careerGrowth','media','poster'], e.target.value)}
                        className="w-full bg-gray-600 rounded px-3 py-2 md:col-span-2"
                        placeholder="Poster URL (for video)"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','careerGrowth','media','poster'], '')}
                      >Remove Poster</button>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            {/* Hands-on + Who It's For */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Hands-on Project</h3>
                <input
                  type="text"
                  value={content.workshop?.handsOn?.title || ''}
                  onChange={(e) => handleNestedChange(['workshop','handsOn','title'], e.target.value)}
                  ref={(el) => { wRefs.current.handsTitle = el; }}
                  className="w-full bg-gray-600 rounded px-3 py-2"
                  placeholder="Title"
                />
                <textarea
                  value={content.workshop?.handsOn?.text || ''}
                  onChange={(e) => handleNestedChange(['workshop','handsOn','text'], e.target.value)}
                  ref={(el) => { wRefs.current.handsText = el as unknown as HTMLTextAreaElement; }}
                  className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Description"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Media</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      className="bg-gray-600 rounded px-3 py-2"
                      value={content.workshop?.handsOn?.media?.kind || 'image'}
                      onChange={(e) => handleNestedChange(['workshop','handsOn','media'], { ...(content.workshop?.handsOn?.media || {}), kind: e.target.value })}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text"
                      value={content.workshop?.handsOn?.media?.src || ''}
                      onChange={(e) => handleNestedChange(['workshop','handsOn','media','src'], e.target.value)}
                      ref={(el) => { wRefs.current.handsMedia = el; }}
                      className="bg-gray-600 rounded px-3 py-2"
                      placeholder="Media URL"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button type="button" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm" onClick={() => openPicker('workshop.handsOn.media.src')}>Browse</button>
                      <label className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm cursor-pointer">
                        Upload
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const url = await uploadFile(file, 'workshop/handsOn');
                          handleNestedChange(['workshop','handsOn','media','src'], url);
                        }} />
                      </label>
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','handsOn','media','src'], '')}
                      >Remove</button>
                    </div>
                  </div>
                  {content.workshop?.handsOn?.media?.kind === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={content.workshop?.handsOn?.media?.poster || ''}
                        onChange={(e) => handleNestedChange(['workshop','handsOn','media','poster'], e.target.value)}
                        className="w-full bg-gray-600 rounded px-3 py-2 md:col-span-2"
                        placeholder="Poster URL (for video)"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
                        onClick={() => handleNestedChange(['workshop','handsOn','media','poster'], '')}
                      >Remove Poster</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Who It's For</h3>
                <div className="space-y-2">
                  {(content.workshop?.whoItsFor?.bullets || ['Students','Tech-Professionals','Robotic Enthusiasts','Hardware Developers']).map((b, idx) => (
                    <div key={idx} className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const next = [...(content.workshop?.whoItsFor?.bullets || [])];
                          while (next.length <= idx) next.push('');
                          next[idx] = e.target.value;
                          handleNestedChange(['workshop','whoItsFor','bullets'], next);
                        }}
                        ref={(el) => { wRefs.current.bullets[idx] = el; }}
                        className="flex-1 min-w-0 bg-gray-600 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(content.workshop?.whoItsFor?.bullets || [])];
                          if (idx < next.length) next.splice(idx,1);
                          handleNestedChange(['workshop','whoItsFor','bullets'], next);
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-sm shrink-0"
                      >Remove</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNestedChange(['workshop','whoItsFor','bullets'], [...(content.workshop?.whoItsFor?.bullets || []), ''])}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >+ Add Bullet</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  <input
                    type="text"
                    value={content.workshop?.whoItsFor?.priceLabel || ''}
                    onChange={(e) => handleNestedChange(['workshop','whoItsFor','priceLabel'], e.target.value)}
                    ref={(el) => { wRefs.current.priceLabel = el; }}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="Price Label (e.g., $32 ONLY)"
                  />
                  <input
                    type="text"
                    value={content.workshop?.whoItsFor?.cta?.label || ''}
                    onChange={(e) => handleNestedChange(['workshop','whoItsFor','cta','label'], e.target.value)}
                    ref={(el) => { wRefs.current.ctaLabel = el; }}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="CTA Label (e.g., Register Now)"
                  />
                  <input
                    type="text"
                    value={content.workshop?.whoItsFor?.cta?.url || ''}
                    onChange={(e) => handleNestedChange(['workshop','whoItsFor','cta','url'], e.target.value)}
                    ref={(el) => { wRefs.current.ctaUrl = el; }}
                    className="bg-gray-600 rounded px-3 py-2 md:col-span-2"
                    placeholder="CTA URL (e.g., /book-slot?cohort=core-2)"
                  />
                  <input
                    type="text"
                    value={content.workshop?.whoItsFor?.countdownLabel || ''}
                    onChange={(e) => handleNestedChange(['workshop','whoItsFor','countdownLabel'], e.target.value)}
                    ref={(el) => { wRefs.current.countdownLabel = el; }}
                    className="bg-gray-600 rounded px-3 py-2"
                    placeholder="Countdown Label (optional)"
                  />
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-xs text-gray-300">Pick date & time (local)</label>
                      <input
                        type="datetime-local"
                        value={toLocalInputValue(content.workshop?.whoItsFor?.countdownTargetISO)}
                        onChange={(e) => {
                          const v = e.target.value; // local time
                          if (!v) {
                            handleNestedChange(['workshop','whoItsFor','countdownTargetISO'], '');
                            return;
                          }
                          const asIso = new Date(v).toISOString();
                          handleNestedChange(['workshop','whoItsFor','countdownTargetISO'], asIso);
                        }}
                        ref={(el) => { wRefs.current.countdownISO = el; }}
                        className="bg-gray-600 rounded px-3 py-2"
                      />
                      <p className="text-[11px] text-gray-300">
                        Saved in UTC automatically. Example: 2026-03-01 10:00 (your time) → 2026-03-01T09:00:00Z.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-5 md:pt-6">
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-400 rounded"
                        onClick={() => {
                          const base = new Date();
                          base.setHours(base.getHours() + 1);
                          handleNestedChange(['workshop','whoItsFor','countdownTargetISO'], base.toISOString());
                        }}
                      >+1 hr</button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-400 rounded"
                        onClick={() => {
                          const base = new Date();
                          base.setDate(base.getDate() + 1);
                          handleNestedChange(['workshop','whoItsFor','countdownTargetISO'], base.toISOString());
                        }}
                      >+1 day</button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-400 rounded"
                        onClick={() => {
                          const base = new Date();
                          base.setMonth(base.getMonth() + 1);
                          handleNestedChange(['workshop','whoItsFor','countdownTargetISO'], base.toISOString());
                        }}
                      >+1 month</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-fidelity Preview (identical layout to homepage remaining section) */}
            <div className="relative border border-white/10 rounded-xl p-6 bg-black/30 overflow-x-auto max-w-full">
              <div className="absolute inset-0 pointer-events-none rounded-xl" />
              <div className="relative">
                {/* Heading */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold cursor-pointer" onClick={() => focusRef(wRefs.current.title)}>{content.workshop?.title || 'ROBOTICS CORE WORKSHOP - 2.0'}</h3>
                  {content.workshop?.subtitle && (
                    <p className="text-sm text-gray-400 mt-1 cursor-pointer" onClick={() => focusRef(wRefs.current.subtitle)}>{content.workshop.subtitle}</p>
                  )}
                </div>

                {/* Top Two Cards: Learn the Right Tools / Industry relevant skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* LeftFeature card */}
                  <div className="relative rounded-2xl border border-white/10 p-6 bg-gray-900/40">
                    <div className="text-2xl font-bold mb-2 cursor-pointer" onClick={() => focusRef(wRefs.current.leftTitle)}>{content.workshop?.leftFeature?.title || 'Learn the Right Tools'}</div>
                    <p className="text-gray-300 text-sm mb-4 cursor-pointer" onClick={() => focusRef(wRefs.current.leftText)}>{content.workshop?.leftFeature?.text || 'From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et'}</p>
                    <div className="mt-10 h-48 rounded-lg border border-white/10 overflow-hidden cursor-pointer" onClick={() => focusRef(wRefs.current.leftMedia)}>
                      {content.workshop?.leftFeature?.media?.src ? (
                        content.workshop.leftFeature.media.kind === 'video' ? (
                          <video className="w-full h-full object-cover" src={content.workshop.leftFeature.media.src} poster={content.workshop.leftFeature.media.poster || undefined} />
                        ) : (
                          <img className="w-full h-full object-cover" src={content.workshop.leftFeature.media.src} alt="Left feature media" />
                        )
                      ) : (
                        <div className="w-full h-full bg-linear-to-b from-gray-800 to-black flex items-center justify-center text-gray-500 text-xs">No media selected</div>
                      )}
                    </div>
                  </div>
                  {/* RightFeature card */}
                  <div className="relative rounded-2xl border border-white/10 p-6 bg-gray-900/40">
                    <div className="text-2xl font-bold mb-2 cursor-pointer" onClick={() => focusRef(wRefs.current.rightTitle)}>{content.workshop?.rightFeature?.title || 'Industry relevant skills'}</div>
                    <p className="text-gray-300 text-sm mb-4 cursor-pointer" onClick={() => focusRef(wRefs.current.rightText)}>{content.workshop?.rightFeature?.text || 'From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et'}</p>
                    <div className="mt-10 h-48 rounded-lg border border-white/10 overflow-hidden cursor-pointer" onClick={() => focusRef(wRefs.current.rightMedia)}>
                      {content.workshop?.rightFeature?.media?.src ? (
                        content.workshop.rightFeature.media.kind === 'video' ? (
                          <video className="w-full h-full object-cover" src={content.workshop.rightFeature.media.src} poster={content.workshop.rightFeature.media.poster || undefined} />
                        ) : (
                          <img className="w-full h-full object-cover" src={content.workshop.rightFeature.media.src} alt="Right feature media" />
                        )
                      ) : (
                        <div className="w-full h-full bg-linear-to-b from-gray-800 to-black flex items-center justify-center text-gray-500 text-xs">No media selected</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Row: Hands-on / Countdown + Who it's for / Career Growth */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Hands-on Project */}
                  <div className="relative rounded-2xl border border-white/10 p-6 bg-gray-900/40">
                    <div className="text-xl font-bold mb-2 cursor-pointer" onClick={() => focusRef(wRefs.current.handsTitle)}>{content.workshop?.handsOn?.title || 'Hands-on Project'}</div>
                    <p className="text-gray-300 text-sm mb-4 cursor-pointer" onClick={() => focusRef(wRefs.current.handsText)}>{content.workshop?.handsOn?.text || 'From Python to Raspberry pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et'}</p>
                    <div className="mt-4 h-36 rounded-lg border border-white/10 overflow-hidden cursor-pointer" onClick={() => focusRef(wRefs.current.handsMedia)}>
                      {content.workshop?.handsOn?.media?.src ? (
                        content.workshop.handsOn.media.kind === 'video' ? (
                          <video className="w-full h-full object-cover" src={content.workshop.handsOn.media.src} poster={content.workshop.handsOn.media.poster || undefined} />
                        ) : (
                          <img className="w-full h-full object-cover" src={content.workshop.handsOn.media.src} alt="Hands-on media" />
                        )
                      ) : (
                        <div className="w-full h-full bg-linear-to-b from-gray-800 to-black flex items-center justify-center text-gray-500 text-xs">No media selected</div>
                      )}
                    </div>
                  </div>

                  {/* Countdown + Who it's for */}
                  <div className="relative rounded-2xl border border-white/10 p-6 bg-gray-900/40">
                    <div className="border border-white/20 rounded-xl p-4 mb-5 cursor-pointer" onClick={() => focusRef(wRefs.current.countdownISO)}>
                      <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
                        <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); focusRef(wRefs.current.countdownLabel); }}>
                          {(content.workshop?.title || 'ROBOTICS CORE 2.0') + ' ' + (content.workshop?.whoItsFor?.countdownLabel || 'Begins in')}
                        </span>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300">🔔</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                        <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); focusRef(wRefs.current.countdownISO); }}>
                          <div className="text-2xl font-bold">{String(Math.floor(diffMs / 3_600_000)).padStart(2,'0')}</div>
                          <div className="text-[10px] text-gray-400">Hrs</div>
                        </div>
                        <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); focusRef(wRefs.current.countdownISO); }}>
                          <div className="text-2xl font-bold">{String(Math.floor((diffMs % 3_600_000) / 60_000)).padStart(2,'0')}</div>
                          <div className="text-[10px] text-gray-400">Mins</div>
                        </div>
                        <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); focusRef(wRefs.current.countdownISO); }}>
                          <div className="text-2xl font-bold text-[#CCFF00]">{String(Math.floor((diffMs % 60_000) / 1000)).padStart(2,'0')}</div>
                          <div className="text-[10px] text-gray-400">Secs</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-bold mb-2">WHO IT&apos;S FOR</div>
                      <ul className="space-y-1 mb-4">
                        {(content.workshop?.whoItsFor?.bullets?.length ? content.workshop.whoItsFor.bullets : ['Students','Tech-Professionals','Robotic Enthusiasts','Hardware Developers']).map((b, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer" onClick={() => focusWorkshopBullet(i)}>
                            <span className="inline-block w-2 h-2 rounded-full bg-[#CCFF00]"></span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <a href={content.workshop?.whoItsFor?.cta?.url || '/book-slot?cohort=core-2'} className="block w-full text-center bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold py-2 rounded-lg cursor-pointer" onClick={(e) => { e.preventDefault(); focusRef(wRefs.current.ctaLabel); }}>
                        {content.workshop?.whoItsFor?.cta?.label || 'Register Now'}
                      </a>
                      <div className="text-center mt-3 text-white font-bold cursor-pointer" onClick={() => focusRef(wRefs.current.priceLabel)}>{content.workshop?.whoItsFor?.priceLabel || '$32 ONLY'}</div>
                    </div>
                  </div>

                  {/* Career Growth (media preview) */}
                  <div className="relative rounded-2xl border border-white/10 p-6 bg-gray-900/40">
                    <div className="text-xl font-bold mb-2 cursor-pointer" onClick={() => focusRef(wRefs.current.careerTitle)}>{content.workshop?.careerGrowth?.title || 'Career Growth'}</div>
                    <p className="text-gray-300 text-sm mb-4 cursor-pointer" onClick={() => focusRef(wRefs.current.careerText)}>{content.workshop?.careerGrowth?.text || 'From Python to Raspberry Pi learn from Aurora ist amet. Ad molestiae adipisci ut velit corrupti et'}</p>
                    <div className="mt-4 h-36 rounded-lg border border-white/10 overflow-hidden cursor-pointer" onClick={() => focusRef(wRefs.current.careerMedia)}>
                      {content.workshop?.careerGrowth?.media?.src ? (
                        content.workshop.careerGrowth.media.kind === 'video' ? (
                          <video className="w-full h-full object-cover" src={content.workshop.careerGrowth.media.src} poster={content.workshop.careerGrowth.media.poster || undefined} />
                        ) : (
                          <img className="w-full h-full object-cover" src={content.workshop.careerGrowth.media.src} alt="Career media" />
                        )
                      ) : (
                        <div className="w-full h-full bg-linear-to-b from-gray-800 to-black flex items-center justify-center text-gray-500 text-xs">No media selected</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summaries preview removed */}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Section Title</label>
                <input
                  type="text"
                  value={content.testimonials?.title || ''}
                  onChange={(e) => handleNestedChange(['testimonials', 'title'], e.target.value)}
                  ref={(el) => { tRefs.current.title = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={content.testimonials?.subtitle || ''}
                  onChange={(e) => handleNestedChange(['testimonials', 'subtitle'], e.target.value)}
                  ref={(el) => { tRefs.current.subtitle = el; }}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Testimonial Items</h3>
                <button
                  onClick={() => {
                    const newItem = { 
                      name: '', 
                      role: '', 
                      text: '', 
                      avatar: '' 
                    };
                    handleNestedChange(
                      ['testimonials', 'items'], 
                      [...(content.testimonials?.items || []), newItem]
                    );
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  + Add Testimonial
                </button>
              </div>

              <div className="space-y-4">
                {content.testimonials?.items?.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-1">Avatar</label>
                        <div className="flex items-center space-x-2">
                          {item.avatar ? (
                            <img 
                              src={item.avatar} 
                              alt="Avatar preview" 
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-gray-400">Image</span>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                try {
                                  const url = await uploadFile(file, 'testimonials/avatars');
                                  const newItems = [...(content.testimonials?.items || [])];
                                  newItems[index] = { ...newItems[index], avatar: url };
                                  handleNestedChange(['testimonials', 'items'], newItems);
                                } catch (error) {
                                  console.error('Error uploading avatar:', error);
                                }
                              }}
                              className="hidden"
                              id={`avatar-upload-${index}`}
                            />
                            <label
                              htmlFor={`avatar-upload-${index}`}
                              className="inline-block bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded cursor-pointer text-sm"
                            >
                              {item.avatar ? 'Change' : 'Upload'}
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-9 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => {
                                const newItems = [...(content.testimonials?.items || [])];
                                newItems[index] = { ...newItems[index], name: e.target.value };
                                handleNestedChange(['testimonials', 'items'], newItems);
                              }}
                              ref={(el) => {
                                const arr = tRefs.current.items;
                                if (!arr[index]) arr[index] = { name: null, role: null, text: null };
                                arr[index].name = el;
                              }}
                              className="w-full bg-gray-600 rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <input
                              type="text"
                              value={item.role || ''}
                              onChange={(e) => {
                                const newItems = [...(content.testimonials?.items || [])];
                                newItems[index] = { ...newItems[index], role: e.target.value };
                                handleNestedChange(['testimonials', 'items'], newItems);
                              }}
                              ref={(el) => {
                                const arr = tRefs.current.items;
                                if (!arr[index]) arr[index] = { name: null, role: null, text: null };
                                arr[index].role = el;
                              }}
                              className="w-full bg-gray-600 rounded px-3 py-2"
                              placeholder="e.g., Student, Alumni"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Testimonial</label>
                          <textarea
                            value={item.text || ''}
                            onChange={(e) => {
                              const newItems = [...(content.testimonials?.items || [])];
                              newItems[index] = { ...newItems[index], text: e.target.value };
                              handleNestedChange(['testimonials', 'items'], newItems);
                            }}
                            ref={(el) => {
                              const arr = tRefs.current.items;
                              if (!arr[index]) arr[index] = { name: null, role: null, text: null };
                              arr[index].text = el as unknown as HTMLTextAreaElement;
                            }}
                            className="w-full bg-gray-600 rounded px-3 py-2 h-24"
                            placeholder="Share your experience..."
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`featured-${index}`}
                              checked={content.testimonials?.featuredIndex === index}
                              onChange={(e) => {
                                handleNestedChange(
                                  ['testimonials', 'featuredIndex'],
                                  e.target.checked ? index : undefined
                                );
                              }}
                              className="h-4 w-4 rounded"
                            />
                            <label htmlFor={`featured-${index}`} className="text-sm">
                              Feature this testimonial
                            </label>
                          </div>
                          
                          <button
                            onClick={() => {
                              const newItems = [...(content.testimonials?.items || [])];
                              newItems.splice(index, 1);
                              handleNestedChange(['testimonials', 'items'], newItems);
                              
                              // Reset featured index if the featured item is removed
                              if (content.testimonials?.featuredIndex === index) {
                                handleNestedChange(['testimonials', 'featuredIndex'], undefined);
                              } else if (content.testimonials?.featuredIndex && content.testimonials.featuredIndex > index) {
                                // Adjust featured index if needed
                                handleNestedChange(
                                  ['testimonials', 'featuredIndex'], 
                                  content.testimonials.featuredIndex - 1
                                );
                              }
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Lead Quote */}
            <div>
              <label className="block text-sm font-medium mb-1">Lead Quote</label>
              <textarea
                value={content.testimonials?.leadQuote || ''}
                onChange={(e) => handleNestedChange(['testimonials', 'leadQuote'], e.target.value)}
                ref={(el) => { tRefs.current.leadQuote = el; }}
                className="w-full bg-gray-700 rounded px-3 py-2 h-24"
                placeholder="A compelling quote to highlight in the center of the section"
              />
            </div>
            
            {/* Featured Media */}
            <div>
              <h3 className="text-lg font-medium mb-2">Featured Media</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Featured Video URL (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={content.testimonials?.heroVideo || ''}
                        onChange={(e) => handleNestedChange(['testimonials', 'heroVideo'], e.target.value)}
                        ref={(el) => { tRefs.current.heroVideo = el; }}
                        className="flex-1 min-w-0 bg-gray-600 rounded px-3 py-2"
                        placeholder="https://example.com/video.mp4"
                      />
                      <button
                        onClick={() => openPicker('testimonials.heroVideo')}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded shrink-0"
                        type="button"
                      >
                        Browse
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Enter a direct URL to a video file or embed code
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Video Poster Image (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={content.testimonials?.heroPoster || ''}
                        onChange={(e) => handleNestedChange(['testimonials', 'heroPoster'], e.target.value)}
                        ref={(el) => { tRefs.current.heroPoster = el; }}
                        className="flex-1 min-w-0 bg-gray-600 rounded px-3 py-2"
                        placeholder="https://example.com/poster.jpg"
                      />
                      <button
                        onClick={() => openPicker('testimonials.heroPoster')}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded shrink-0"
                        type="button"
                      >
                        Browse
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Preview image that shows before the video loads
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Fallback Image</label>
                    <div className="flex items-start gap-4 flex-wrap max-w-full">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="text"
                            value={content.testimonials?.heroImage || ''}
                            onChange={(e) => handleNestedChange(['testimonials', 'heroImage'], e.target.value)}
                            ref={(el) => { tRefs.current.heroImage = el; }}
                            className="flex-1 bg-gray-600 rounded px-3 py-2"
                            placeholder="https://example.com/image.jpg"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              try {
                                const url = await uploadFile(file, 'testimonials/featured');
                                handleNestedChange(['testimonials', 'heroImage'], url);
                              } catch (error) {
                                console.error('Error uploading image:', error);
                              }
                            }}
                            className="hidden"
                            id="featured-image-upload"
                          />
                          <label
                            htmlFor="featured-image-upload"
                            className="whitespace-nowrap bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded cursor-pointer text-sm flex items-center"
                          >
                            Upload
                          </label>
                          <button
                            onClick={() => openPicker('testimonials.heroImage')}
                            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                            type="button"
                          >
                            Browse
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          This image will be shown if no video is provided or if video fails to load
                        </p>
                      </div>
                      
                      {(content.testimonials?.heroImage || content.testimonials?.heroVideo) && (
                        <div className="w-32 h-24 bg-black rounded overflow-hidden shrink">
                          {content.testimonials.heroVideo ? (
                            <div className="relative w-full h-full">
                              <video
                                src={content.testimonials.heroVideo}
                                className="w-full h-full object-cover"
                                controls={false}
                                poster={content.testimonials.heroPoster || undefined}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={content.testimonials.heroImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Preview Section - Replicates Frontend Layout */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="bg-black/30 border border-white/10 rounded-lg p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Left: Header + compact list */}
                      <div className="space-y-4">
                        <div
                          className="inline-flex items-center px-2 py-1 rounded-full text-[10px] tracking-wide bg-lime-300/10 text-lime-300 border border-lime-300/30"
                          onClick={() => focusRef(tRefs.current.title)}
                        >
                          {(content.testimonials?.badgeLabel || 'TESTIMONIALS')}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold" onClick={() => focusRef(tRefs.current.title)}>{content.testimonials?.title || 'Section title'}</h3>
                          <p className="text-sm text-gray-400 mt-1" onClick={() => focusRef(tRefs.current.subtitle)}>
                            {content.testimonials?.subtitle || 'Section subtitle'}
                          </p>
                        </div>
                        {content.testimonials?.seeMore?.label && content.testimonials?.seeMore?.url && (
                          <a href={content.testimonials.seeMore.url} className="text-sm text-lime-300 hover:underline inline-flex items-center gap-1">
                            {content.testimonials.seeMore.label}
                            <span className="inline-block h-1 w-1 rounded-full bg-lime-300"></span>
                          </a>
                        )}
                        <div className="space-y-2">
                          {(content.testimonials?.items && content.testimonials.items.length > 0
                            ? content.testimonials.items
                            : [
                                { name: 'Sample Person', role: 'Role', avatar: '' },
                                { name: 'Another Person', role: 'Role', avatar: '' },
                              ]
                          ).slice(0, 2).map((it, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-800/60 border border-white/10 rounded-full px-3 py-2 cursor-pointer" onClick={() => focusOrCreateItem(i, 'name')}>
                              <img
                                src={it?.avatar || 'https://i.pravatar.cc/48?img=12'}
                                alt={it?.name || 'Avatar'}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-medium truncate">{it?.name || 'Sample Person'}</div>
                                <div className="text-[10px] text-gray-400 truncate">{it?.role || 'Role'}</div>
                              </div>
                              <span className="ml-auto h-2 w-2 rounded-full bg-lime-300"></span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Middle: Quote card */}
                      <div className="bg-gray-800/60 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                        <div className="text-5xl text-gray-500 leading-none">“</div>
                        <p className="text-gray-300 text-sm leading-relaxed cursor-pointer" onClick={() => focusRef(tRefs.current.leadQuote)}>
                          {content.testimonials?.leadQuote || 'A compelling quote to highlight in the center of the section.'}
                        </p>
                        {(() => {
                          const idx = content.testimonials?.featuredIndex ?? 0;
                          const it = content.testimonials?.items?.[idx] || { name: 'Sample Person', role: 'Role', avatar: '' };
                          return (
                            <div className="mt-4 flex items-center gap-2">
                              <img src={it.avatar || 'https://i.pravatar.cc/64?img=14'} alt={it.name || 'Avatar'} className="h-6 w-6 rounded-full object-cover cursor-pointer" onClick={() => focusOrCreateItem(idx, 'name')} />
                              <div className="text-xs">
                                <div className="font-medium cursor-pointer" onClick={() => focusOrCreateItem(idx, 'name')}>{it.name || 'Sample Person'}</div>
                                <div className="text-gray-400 cursor-pointer" onClick={() => focusOrCreateItem(idx, 'role')}>{it.role || 'Role'}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Right: Featured media */}
                      <div className="bg-gray-800/60 border border-white/10 rounded-xl p-4">
                        {(() => {
                          const idx = content.testimonials?.featuredIndex ?? 0;
                          const it = content.testimonials?.items?.[idx] || { name: 'Sample Person', role: 'Role', avatar: '' };
                          return (
                            <div className="mb-3 flex items-center gap-2 cursor-pointer" onClick={() => focusOrCreateItem(idx, 'name')}>
                              <img src={it.avatar || 'https://i.pravatar.cc/64?img=14'} alt={it?.name || 'Avatar'} className="h-6 w-6 rounded-full object-cover" />
                              <div className="text-xs">
                                <div className="font-medium truncate max-w-[10rem]">{it?.name || 'Sample Person'}</div>
                                <div className="text-gray-400 truncate max-w-[10rem]">{it?.role || 'Role'}</div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="relative rounded-lg overflow-hidden aspect-video bg-black cursor-pointer" onClick={() => focusRef(content.testimonials?.heroVideo ? tRefs.current.heroVideo : tRefs.current.heroImage)}>
                          {content.testimonials?.heroVideo ? (
                            <>
                              <video
                                src={content.testimonials.heroVideo}
                                className="w-full h-full object-cover"
                                poster={content.testimonials.heroPoster || undefined}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 border border-white/40 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              </div>
                            </>
                          ) : content.testimonials?.heroImage ? (
                            <img src={content.testimonials.heroImage} alt="Featured" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">No media selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Media Picker Modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickTarget(null);
        }}
        onSelect={(url) => {
          if (!pickTarget) return;
          const path = pickTarget.split('.');
          handleNestedChange(path, url);
        }}
      />
    </div>
  );
}
