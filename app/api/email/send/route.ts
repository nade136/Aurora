import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

function env(name: string, fallback?: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

const RESEND_API_KEY = env("RESEND_API_KEY");
const RESEND_FROM = env("RESEND_FROM"); // e.g., "Aurora <no-reply@yourdomain.com>"
const RESEND_REPLY_TO = env("RESEND_REPLY_TO");
const EMAIL_DAILY_CAP = Number(env("EMAIL_DAILY_CAP", "300"));

type Attachment = { name: string; mime?: string; contentBase64: string };

type Recipient = {
  email: string;
  name?: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
  replyTo?: string;
  meta?: {
    student_id?: string;
    cert_code?: string;
  };
};

type ResendAttachment = { filename: string; content: string };
type ResendEmailPayload = {
  from: string; // "Name <email@domain>" or just email
  to: string[];
  subject: string;
  html: string;
  attachments?: ResendAttachment[];
  reply_to?: string | string[];
};

type ResendResponse = {
  id?: string;
  error?: { message?: string };
};

export async function POST(req: Request) {
  try {
    if (!RESEND_API_KEY || !RESEND_FROM) {
      return NextResponse.json({ error: "Missing Resend env config" }, { status: 500 });
    }

    const data = (await req.json()) as { recipients?: Recipient[] };
    const recipients: Recipient[] = data?.recipients ?? [];

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }

    if (recipients.length > EMAIL_DAILY_CAP) {
      return NextResponse.json({ error: `Exceeds daily cap of ${EMAIL_DAILY_CAP}` }, { status: 429 });
    }

    const results: Array<{ email: string; ok: boolean; id?: string; error?: string }> = [];

    for (const r of recipients) {
      try {
        const payload: ResendEmailPayload = {
          from: RESEND_FROM!,
          to: [r.email],
          subject: r.subject,
          html: r.body,
        };
        if (r.attachments && r.attachments.length > 0) {
          payload.attachments = r.attachments.map((a) => ({ filename: a.name, content: a.contentBase64 }));
        }
        if (RESEND_REPLY_TO || r.replyTo) {
          payload.reply_to = RESEND_REPLY_TO || r.replyTo;
        }

        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const t = await resp.text();
          results.push({ email: r.email, ok: false, error: `Resend ${resp.status}: ${t}`.slice(0, 500) });
          continue;
        }
        const json = (await resp.json()) as ResendResponse;
        results.push({ email: r.email, ok: true, id: json?.id });
        // Log success (best-effort)
        try {
          const sb = getAdminSupabase();
          await sb.from("certificate_sends").insert({
            student_id: r.meta?.student_id ?? null,
            email: r.email,
            subject: r.subject,
            body_html: r.body,
            attachment_names: (r.attachments || []).map(a => a.name),
            status: "sent",
            message_id: json?.id ?? null,
          });
        } catch {}
      } catch (e: unknown) {
        const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
        results.push({ email: r.email, ok: false, error: msg });
        // Log failure (best-effort)
        try {
          const sb = getAdminSupabase();
          await sb.from("certificate_sends").insert({
            student_id: r.meta?.student_id ?? null,
            email: r.email,
            subject: r.subject,
            body_html: r.body,
            attachment_names: (r.attachments || []).map(a => a.name),
            status: "failed",
            message_id: null,
            error: msg,
          });
        } catch {}
      }
    }

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
