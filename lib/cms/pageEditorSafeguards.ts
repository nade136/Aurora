import type { SupabaseClient } from "@supabase/supabase-js";
import type { HomeContent } from "@/lib/schemas/home";

const BACKUP_SLUG_SUFFIX = "-backup";

export function backupSlugForPage(slug: string) {
  return `${slug}${BACKUP_SLUG_SUFFIX}`;
}

/** Detect obvious placeholder copy before overwriting live content. */
export function looksLikePlaceholderContent(content: HomeContent, slug: string): boolean {
  const sub = (content.hero?.subtext || "").toLowerCase();
  const heading = (content.hero?.heading || "").trim();
  const hasLorem = sub.includes("lorem ipsum");
  const defaultHeading =
    slug === "home" && heading === "ACCELERATE YOUR\nROBOTICS CAREER";
  const emptyWhatWeDo =
    slug === "home" &&
    (!content.whatWeDo?.items || content.whatWeDo.items.length === 0);
  return hasLorem || (defaultHeading && emptyWhatWeDo);
}

export function confirmIfPlaceholder(content: HomeContent, slug: string): boolean {
  if (!looksLikePlaceholderContent(content, slug)) return true;
  return window.confirm(
    "This looks like placeholder text (e.g. Lorem ipsum or empty sections). Saving will replace what is on the site. Continue anyway?",
  );
}

export type SnapshotBackup = { content_json?: HomeContent };

/** Keep a single rolling backup row before each save/publish (slug: home-backup, etc.). */
export async function archivePageContentBeforeWrite(
  supabase: SupabaseClient,
  pageId: string | null | undefined,
  slug: string,
  previous: unknown,
): Promise<void> {
  if (!pageId || previous == null || typeof previous !== "object") return;
  const serialized = JSON.stringify(previous);
  if (serialized.length < 200) return;

  const { error } = await supabase.from("published_snapshots").upsert({
    page_id: pageId,
    slug: backupSlugForPage(slug),
    data: { content_json: previous },
    published_at: new Date().toISOString(),
  });
  if (error) console.error("Backup before save failed:", error.message);
}
