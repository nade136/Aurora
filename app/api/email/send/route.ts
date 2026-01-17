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
const BREVO_API_KEY = env("BREVO_API_KEY");
const BREVO_FROM = env("BREVO_FROM");
const BREVO_REPLY_TO = env("BREVO_REPLY_TO");

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

type BrevoAttachment = { name: string; content: string };
type BrevoEmailPayload = {
  sender: { email: string; name?: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  attachment?: BrevoAttachment[];
  replyTo?: string;
};

function parseFrom(input?: string): { name?: string; email?: string } {
  if (!input) return {};
  const m = input.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1]?.trim() || undefined, email: m[2]?.trim() || undefined };
  return { email: input.trim() };
}

export async function POST(req: Request) {
  try {
    if (!RESEND_API_KEY || !RESEND_FROM) {
      return NextResponse.json(
        { error: "Missing Resend env config" },
        { status: 500 }
      );
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    let data: { recipients?: Recipient[] };
    try {
      data = (await req.json()) as { recipients?: Recipient[] };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const recipients: Recipient[] = data?.recipients ?? [];

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients provided" },
        { status: 400 }
      );
    }


    // Enforce true per-day limit (UTC day) using Supabase logs in certificate_sends
    const sb = getAdminSupabase();
    const now = new Date();
    const startOfUtcDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const endOfUtcDay = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    // Count "sent" emails today
    const { count: sentToday, error: countError } = await sb
      .from("certificate_sends")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("created_at", startOfUtcDay.toISOString())
      .lte("created_at", endOfUtcDay.toISOString());

    if (countError) {
      return NextResponse.json(
        {
          error: `Counting error: ${countError.message || String(countError)}`,
        },
        { status: 500 }
      );
    }

    const todayCount = typeof sentToday === "number" ? sentToday : 0;
    const remainingBefore = Math.max(EMAIL_DAILY_CAP - todayCount, 0);

    if (recipients.length > remainingBefore) {
      return NextResponse.json(
        {
          error: `Daily cap reached. Remaining today: ${remainingBefore}`,
          remainingBefore,
          requested: recipients.length,
        },
        { status: 429 }
      );
    }

    const results: Array<{
      email: string;
      ok: boolean;
      id?: string;
      error?: string;
    }> = [];

    for (const r of recipients) {
      try {
        const payload: ResendEmailPayload = {
          from: RESEND_FROM!,
          to: [r.email],
          subject: r.subject,
          html: r.body,
        };
        if (r.attachments && r.attachments.length > 0) {
          payload.attachments = r.attachments.map((a) => ({
            filename: a.name,
            content: a.contentBase64,
          }));
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
          const resendErr = await resp.text();
          let sentViaBrevo = false;
          if (BREVO_API_KEY && BREVO_FROM) {
            const fromParsed = parseFrom(BREVO_FROM);
            const brevoPayload: BrevoEmailPayload = {
              sender: { email: fromParsed.email || "", name: fromParsed.name },
              to: [{ email: r.email }],
              subject: r.subject,
              htmlContent: r.body,
            };
            if (BREVO_REPLY_TO || r.replyTo) {
              brevoPayload.replyTo = r.replyTo || BREVO_REPLY_TO || undefined;
            }
            if (r.attachments && r.attachments.length > 0) {
              brevoPayload.attachment = r.attachments.map((a) => ({
                name: a.name,
                content: a.contentBase64,
              }));
            }
            try {
              const bresp = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": String(BREVO_API_KEY),
                },
                body: JSON.stringify(brevoPayload),
              });
              if (bresp.ok) {
                const bjson = (await bresp.json()) as { messageId?: string };
                results.push({ email: r.email, ok: true, id: bjson?.messageId });
                try {
                  const sb2 = getAdminSupabase();
                  await sb2.from("certificate_sends").insert({
                    student_id: r.meta?.student_id ?? null,
                    email: r.email,
                    subject: r.subject,
                    body_html: r.body,
                    attachment_names: (r.attachments || []).map((a) => a.name),
                    status: "sent",
                    message_id: bjson?.messageId ?? null,
                  });
                } catch {}
                sentViaBrevo = true;
              }
            } catch {}
          }
          if (!sentViaBrevo) {
            results.push({
              email: r.email,
              ok: false,
              error: `Resend ${resp.status}: ${resendErr}`.slice(0, 500),
            });
          }
          continue;
        }
        const json = (await resp.json()) as ResendResponse;
        results.push({ email: r.email, ok: true, id: json?.id });
        try {
          const sb2 = getAdminSupabase();
          await sb2.from("certificate_sends").insert({
            student_id: r.meta?.student_id ?? null,
            email: r.email,
            subject: r.subject,
            body_html: r.body,
            attachment_names: (r.attachments || []).map((a) => a.name),
            status: "sent",
            message_id: json?.id ?? null,
          });
        } catch {}
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : String(e);
        let handled = false;
        if (BREVO_API_KEY && BREVO_FROM) {
          const r2 = r;
          try {
            const fromParsed = parseFrom(BREVO_FROM);
            const brevoPayload: BrevoEmailPayload = {
              sender: { email: fromParsed.email || "", name: fromParsed.name },
              to: [{ email: r2.email }],
              subject: r2.subject,
              htmlContent: r2.body,
            };
            if (BREVO_REPLY_TO || r2.replyTo) {
              brevoPayload.replyTo = r2.replyTo || BREVO_REPLY_TO || undefined;
            }
            if (r2.attachments && r2.attachments.length > 0) {
              brevoPayload.attachment = r2.attachments.map((a) => ({
                name: a.name,
                content: a.contentBase64,
              }));
            }
            const bresp = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": String(BREVO_API_KEY),
              },
              body: JSON.stringify(brevoPayload),
            });
            if (bresp.ok) {
              const bjson = (await bresp.json()) as { messageId?: string };
              results.push({ email: r2.email, ok: true, id: bjson?.messageId });
              try {
                const sb2 = getAdminSupabase();
                await sb2.from("certificate_sends").insert({
                  student_id: r2.meta?.student_id ?? null,
                  email: r2.email,
                  subject: r2.subject,
                  body_html: r2.body,
                  attachment_names: (r2.attachments || []).map((a) => a.name),
                  status: "sent",
                  message_id: bjson?.messageId ?? null,
                });
              } catch {}
              handled = true;
            }
          } catch {}
        }
        if (!handled) {
          results.push({ email: r.email, ok: false, error: msg });
        }
        // Log failure (best-effort)
        try {
          const sb3 = getAdminSupabase();
          await sb3.from("certificate_sends").insert({
            student_id: r.meta?.student_id ?? null,
            email: r.email,
            subject: r.subject,
            body_html: r.body,
            attachment_names: (r.attachments || []).map((a) => a.name),
            status: "failed",
            message_id: null,
            error: msg,
          });
        } catch {}
      }
    }

    const sentThisRequest = results.filter((r) => r.ok).length;
    const remainingAfter = Math.max(remainingBefore - sentThisRequest, 0);
    return NextResponse.json({
      results,
      remainingBefore,
      sentThisRequest,
      remainingAfter,
    });
  } catch (err: unknown) {
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
