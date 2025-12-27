import { NextResponse } from "next/server";
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
    const body = (await req.json()) as SaveStudentBody;
    if (!body?.name || !body?.email || !body?.cohort || !body?.issuedAt || !body?.seq) {
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
      // editing existing: ensure no other row has same cert_code
      for (let i = 0; i < 20; i++) {
        const { data: existing, error: exErr } = await supabase
          .from("students")
          .select("id")
          .eq("cert_code", cert_code)
          .neq("id", body.id)
          .maybeSingle();
        if (exErr) break;
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
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
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
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ student: data, cert_code });
    }

    for (let i = 0; i < 20; i++) {
      const { data: existing, error: exErr } = await supabase
        .from("students")
        .select("id")
        .eq("cert_code", cert_code)
        .maybeSingle();
      if (exErr) break; // best-effort; proceed
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student: data, cert_code });
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
