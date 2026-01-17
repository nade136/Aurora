import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { generateCertificateCode } from "@/lib/certificates/code";

export type SaveStudentBody = {
  id?: string;
  name: string;
  email: string;
  position: string;
  cohort: string;
  issuedAt: string; // yyyy-MM-dd
  seq: number;
  status?: "active" | "suspended";
};

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || "";
    try {
      console.log("[certificates/save] content-type=", ct);
    } catch {}
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    let body: SaveStudentBody;
    try {
      body = (await req.json()) as SaveStudentBody;
    } catch {
      try { console.error("[certificates/save] Invalid JSON body"); } catch {}
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    try {
      console.log("[certificates/save] body keys:", Object.keys(body || {}));
      console.log("[certificates/save] preview:", {
        name: body?.name,
        email: body?.email,
        cohort: body?.cohort,
        issuedAt: body?.issuedAt,
        seq: body?.seq,
        hasPosition: !!body?.position,
      });
    } catch {}
    if (!body?.name || !body?.email || !body?.cohort || !body?.issuedAt || !body?.seq) {
      try { console.error("[certificates/save] Missing required fields"); } catch {}
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const issuedAtDate = new Date(`${body.issuedAt}T00:00:00Z`);
    const supabase = getAdminSupabase();

    // compute cert_code and ensure uniqueness
    let seq = body.seq;
    let cert_code = generateCertificateCode({
      companyPrefix: "AURORA",
      cohort: body.cohort,
      fullName: body.name,
      issuedAt: issuedAtDate,
      seq,
    });

    if (body.id) {
      try { console.log("[certificates/save] editing existing id=", body.id); } catch {}
      // editing existing: ensure no other row has same cert_code
      for (let i = 0; i < 20; i++) {
        const { data: existing, error: exErr } = await supabase
          .from("students")
          .select("id")
          .eq("cert_code", cert_code)
          .neq("id", body.id)
          .maybeSingle();
        if (exErr) { try { console.error("[certificates/save] uniqueness check error:", exErr.message); } catch {} break; }
        if (!existing) break;
        seq += 1;
        cert_code = generateCertificateCode({
          companyPrefix: "AURORA",
          cohort: body.cohort,
          fullName: body.name,
          issuedAt: issuedAtDate,
          seq,
        });
      }

      const updatePayload = {
        name: body.name,
        email: body.email,
        position: body.position,
        cohort: body.cohort,
        issued_at: body.issuedAt,
        seq,
        cert_code,
        status: body.status ?? "active",
      };
      const { data, error } = await supabase
        .from("students")
        .update(updatePayload)
        .eq("id", body.id)
        .select()
        .single();
      if (error) {
        try { console.error("[certificates/save] update error:", error.message); } catch {}
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      try { console.log("[certificates/save] updated student id=", data?.id); } catch {}
      return NextResponse.json({ student: data, cert_code });
    }

    // creating new
    // if an existing row matches email+cohort+issued_at, treat as update to avoid duplicates
    const { data: existingSameKey } = await supabase
      .from("students")
      .select("id")
      .eq("email", body.email)
      .eq("cohort", body.cohort)
      .eq("issued_at", body.issuedAt)
      .maybeSingle();
    if (existingSameKey?.id) {
      try { console.log("[certificates/save] upserting existing by key id=", existingSameKey.id); } catch {}
      const updatePayload = {
        name: body.name,
        email: body.email,
        position: body.position,
        cohort: body.cohort,
        issued_at: body.issuedAt,
        seq,
        cert_code,
        status: body.status ?? "active",
      };
      const { data, error } = await supabase
        .from("students")
        .update(updatePayload)
        .eq("id", existingSameKey.id)
        .select()
        .single();
      if (error) {
        try { console.error("[certificates/save] update-existing error:", error.message); } catch {}
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      try { console.log("[certificates/save] updated existing student id=", data?.id); } catch {}
      return NextResponse.json({ student: data, cert_code });
    }

    for (let i = 0; i < 20; i++) {
      const { data: existing, error: exErr } = await supabase
        .from("students")
        .select("id")
        .eq("cert_code", cert_code)
        .maybeSingle();
      if (exErr) { try { console.error("[certificates/save] cert_code uniqueness error:", exErr.message); } catch {} break; } // best-effort; proceed
      if (!existing) break;
      seq += 1;
      cert_code = generateCertificateCode({
        companyPrefix: "AURORA",
        cohort: body.cohort,
        fullName: body.name,
        issuedAt: issuedAtDate,
        seq,
      });
    }

    const insertPayload = {
      name: body.name,
      email: body.email,
      position: body.position,
      cohort: body.cohort,
      issued_at: body.issuedAt,
      seq,
      cert_code,
      status: body.status ?? "active",
    };

    const { data, error } = await supabase
      .from("students")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      try { console.error("[certificates/save] insert error:", error.message); } catch {}
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student: data, cert_code });
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
