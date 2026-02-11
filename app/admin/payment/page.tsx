"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Registration = {
  id: string;
  created_at: string;
  cohort: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  institution: string | null;
  current_position: string | null;
  role_category: string | null;
  social_url: string | null;
};

type Payment = {
  id: string;
  created_at: string;
  registration_id: string | null;
  amount: number | null;
  currency: string | null;
  provider: string | null;
  reference: string | null;
  status: string | null;
  paid_at: string | null;
};

type PaymentRow = Payment & { registration: Registration | null };

type PaymentSettings = {
  id: string;
  updated_at: string;
  amount: number | null;
  currency: string | null;
  current_cohort: string | null;
};

type EmailTemplate = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  subject: string;
  body_html: string;
};

type EmailLog = {
  id: string;
  created_at: string;
  registration_id: string | null;
  email: string;
  subject: string;
  body_html: string;
  attachments: string[] | null;
  status: string;
  provider_message_id: string | null;
  error: string | null;
};

export default function AdminPaymentPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<{ amount: string; currency: string; current_cohort: string }>({
    amount: "50000",
    currency: "NGN",
    current_cohort: "",
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{ name: string; subject: string; body_html: string }>({ name: "", subject: "", body_html: "" });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);

  const [selection, setSelection] = useState<string[]>([]); // payment.registration_id list
  const [sendState, setSendState] = useState<{ sending: boolean; result?: string }>({ sending: false });
  const [bulkTemplateId, setBulkTemplateId] = useState<string>("");
  const [recipientMode, setRecipientMode] = useState<"everyone" | "selected" | "one">("selected");
  const [singleEmail, setSingleEmail] = useState<string>("");
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [viewLog, setViewLog] = useState<EmailLog | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [viewTemplate, setViewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoadingSettings(true);
      setSettingsError(null);
      try {
        const resp = await fetch("/api/admin/payment-settings");
        const payload = await resp.json().catch(() => null);
        if (!resp.ok) {
          setSettingsError(payload?.error || "Failed to load settings");
          setLoadingSettings(false);
          return;
        }
        const s = payload?.data as PaymentSettings | null;
        if (s) {
          setSettings(s);
          setSettingsDraft({
            amount: String(s.amount ?? ""),
            currency: s.currency || "NGN",
            current_cohort: s.current_cohort || "",
          });
        }
      } catch (e: any) {
        setSettingsError(e?.message || "Failed to load settings");
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const triggerDownload = async (url: string, filename: string) => {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return;
    const blob = await resp.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const downloadPaymentsCsv = async () => {
    const base = `payments_${new Date().toISOString().slice(0,10)}`;
    await triggerDownload(`/api/admin/payments/export?format=csv`, `${base}.csv`);
  };

  const downloadPaymentsXlsx = async () => {
    const base = `payments_${new Date().toISOString().slice(0,10)}`;
    await triggerDownload(`/api/admin/payments/export?format=xlsx`, `${base}.xlsx`);
  };

  useEffect(() => {
    const loadPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError(null);
      try {
        const resp = await fetch("/api/admin/payments");
        const payload = await resp.json().catch(() => null);
        if (!resp.ok) {
          const message = payload?.error || payload?.message || `Failed to load payments (${resp.status})`;
          setPaymentsError(message);
          setPayments([]);
          setPaymentsLoading(false);
          return;
        }
        const rows: PaymentRow[] = (payload?.data || []).map((row: any) => ({
          id: row.id,
          created_at: row.created_at,
          registration_id: row.registration_id,
          amount: row.amount,
          currency: row.currency,
          provider: row.provider,
          reference: row.reference,
          status: row.status,
          paid_at: row.paid_at,
          registration: row.registrations || null,
        }));
        setPayments(rows);
      } catch (e: any) {
        setPaymentsError(e?.message || "Failed to load payments");
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };
    loadPayments();
  }, []);

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      const { data } = await supabase
        .from("email_templates")
        .select("id, created_at, updated_at, name, subject, body_html")
        .order("created_at", { ascending: false });
      setTemplates((data as EmailTemplate[]) || []);
      setTemplatesLoading(false);
    };
    loadTemplates();
  }, [supabase]);

  useEffect(() => {
    const loadEmailLogs = async () => {
      setEmailLogsLoading(true);
      const { data } = await supabase
        .from("email_logs")
        .select("id, created_at, registration_id, email, subject, body_html, attachments, status, provider_message_id, error")
        .order("created_at", { ascending: false })
        .limit(100);
      setEmailLogs((data as EmailLog[]) || []);
      setEmailLogsLoading(false);
    };
    loadEmailLogs();
  }, [supabase]);

  const totalPaid = payments
    .filter((p) => (p.status || "").toLowerCase() === "success")
    .reduce((sum, p) => sum + (Number(p.amount || 0)), 0);
  const currency = settings?.currency || payments.find((x) => x.currency)?.currency || "NGN";

  const downloadPaymentsPdf = () => {
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const rowsHtml = payments
      .map((p) => {
        const name = `${p.registration?.first_name || ""} ${p.registration?.last_name || ""}`.trim() || "-";
        const email = p.registration?.email || "-";
        const cohort = p.registration?.cohort || "-";
        const institution = p.registration?.institution || "-";
        const currentRole = p.registration?.current_position || "-";
        const roleCategory = p.registration?.role_category || "-";
        const social = p.registration?.social_url || "-";
        const amount = `${p.currency || "NGN"} ${Number(p.amount || 0).toLocaleString()}`;
        const status = p.status || "-";
        const ref = p.reference || "-";
        const date = p.created_at ? new Date(p.created_at).toLocaleString() : "-";

        return `
          <tr>
            <td>${escapeHtml(date)}</td>
            <td>${escapeHtml(name)}</td>
            <td>${escapeHtml(email)}</td>
            <td>${escapeHtml(cohort)}</td>
            <td>${escapeHtml(institution)}</td>
            <td>${escapeHtml(currentRole)}</td>
            <td>${escapeHtml(roleCategory)}</td>
            <td>${escapeHtml(social)}</td>
            <td>${escapeHtml(amount)}</td>
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(ref)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payments Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
            h1 { margin: 0 0 8px; font-size: 20px; }
            .meta { margin-bottom: 16px; font-size: 12px; color: #444; }
            .summary { margin-bottom: 16px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Payments Report</h1>
          <div class="meta">Generated: ${escapeHtml(new Date().toLocaleString())}</div>
          <div class="summary">
            <div>Total Paid: ${escapeHtml(`${currency} ${totalPaid.toLocaleString()}`)}</div>
            <div>Successful Payments: ${escapeHtml(String(payments.filter(p => (p.status || "").toLowerCase() === "success").length))}</div>
            <div>Total Registrations: ${escapeHtml(String(new Set(payments.map(p => p.registration_id).filter(Boolean)).size))}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Cohort</th>
                <th>Institution</th>
                <th>Current Role</th>
                <th>Role Category</th>
                <th>Social</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || "<tr><td colspan='11'>No data</td></tr>"}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const printWin = iframe.contentWindow;
    if (!printWin) {
      document.body.removeChild(iframe);
      return;
    }
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  const toggleSelect = (regId: string | null) => {
    if (!regId) return;
    setSelection((prev) => (prev.includes(regId) ? prev.filter((x) => x !== regId) : [...prev, regId]));
  };

  const allSelectableRegIds = Array.from(new Set(payments.map((p) => p.registration_id).filter((x): x is string => Boolean(x))));
  const allSelected = allSelectableRegIds.length > 0 && allSelectableRegIds.every((id) => selection.includes(id));
  const toggleSelectAll = () => {
    setSelection((prev) => (allSelected ? [] : allSelectableRegIds));
  };

  const saveSettings = async () => {
    setLoadingSettings(true);
    setSettingsError(null);
    const amt = Number(String(settingsDraft.amount || "0").replace(/[^0-9.]/g, "")) || 0;
    const cur = (settingsDraft.currency || "NGN").toUpperCase();
    const cohortValue = (settingsDraft.current_cohort || "").trim() || null;
    try {
      const resp = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, currency: cur, current_cohort: cohortValue }),
      });
      const payload = await resp.json().catch(() => null);
      if (!resp.ok) {
        setSettingsError(payload?.error || "Failed to save settings");
        setLoadingSettings(false);
        return;
      }
      const updated = payload?.data as PaymentSettings | null;
      if (updated) {
        setSettings(updated);
        setSettingsDraft({
          amount: String(updated.amount ?? ""),
          currency: updated.currency || "NGN",
          current_cohort: updated.current_cohort || "",
        });
      }
    } catch (e: any) {
      setSettingsError(e?.message || "Failed to save settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const deletePayment = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this payment? This cannot be undone.")) return;
    setDeletingPaymentId(id);
    try {
      await supabase.from("payments").delete().eq("id", id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this template? This cannot be undone.")) return;
    setDeletingTemplateId(id);
    try {
      await supabase.from("email_templates").delete().eq("id", id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (bulkTemplateId === id) setBulkTemplateId("");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const deleteLog = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this email log? This cannot be undone.")) return;
    setDeletingLogId(id);
    try {
      await supabase.from("email_logs").delete().eq("id", id);
      setEmailLogs((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setDeletingLogId(null);
    }
  };

  const sendFromHeader = async () => {
    if (!bulkTemplateId) { alert("Select a template"); return; }
    const tpl = templates.find((t) => t.id === bulkTemplateId);
    if (!tpl) { alert("Template not found"); return; }
    let recipients: Array<{ email: string; name?: string; subject: string; body: string }> = [];
    const emailToRegId = new Map<string, string | null>();

    if (recipientMode === "one") {
      const email = (singleEmail || "").trim();
      if (!email) { alert("Enter an email"); return; }
      recipients = [{ email, subject: tpl.subject, body: tpl.body_html }];
      emailToRegId.set(email, null);
    } else if (recipientMode === "selected") {
      if (selection.length === 0) { alert("Select at least one row"); return; }
      const { data: regs } = await supabase.from("registrations").select("id, first_name, last_name, email").in("id", selection);
      recipients = (regs || [])
        .filter((r: any) => r.email)
        .map((r: any) => {
          const email = r.email as string;
          emailToRegId.set(email, r.id as string);
          return { email, name: `${r.first_name || ""} ${r.last_name || ""}`.trim(), subject: tpl.subject, body: tpl.body_html };
        });
    } else if (recipientMode === "everyone") {
      const unique = new Map<string, { email: string; name?: string; regId: string | null }>();
      for (const p of payments) {
        const email = p.registration?.email || "";
        if (!email) continue;
        const regId = p.registration_id || null;
        if (!unique.has(email)) unique.set(email, { email, name: `${p.registration?.first_name || ""} ${p.registration?.last_name || ""}`.trim(), regId });
      }
      recipients = Array.from(unique.values()).map((v) => {
        emailToRegId.set(v.email, v.regId);
        return { email: v.email, name: v.name, subject: tpl.subject, body: tpl.body_html };
      });
      if (recipients.length === 0) { alert("No recipients found"); return; }
    }

    setSendState({ sending: true });
    try {
      const resp = await fetch("/api/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients }) });
      const json = await resp.json();
      const okOnes = (json?.results || []).filter((x: any) => x.ok);
      const failOnes = (json?.results || []).filter((x: any) => !x.ok);
      if (okOnes.length > 0) {
        const logs = okOnes.map((x: any) => ({ registration_id: emailToRegId.get(x.email) || null, email: x.email, subject: tpl.subject, body_html: tpl.body_html, attachments: [], status: "sent", provider_message_id: x.id || null }));
        await supabase.from("email_logs").insert(logs);
      }
      if (failOnes.length > 0) {
        const logs = failOnes.map((x: any) => ({ registration_id: emailToRegId.get(x.email) || null, email: x.email, subject: tpl.subject, body_html: tpl.body_html, attachments: [], status: "failed", provider_message_id: null, error: String(x.error || "") }));
        await supabase.from("email_logs").insert(logs);
      }
      setSendState({ sending: false, result: `Sent ${okOnes.length}, failed ${failOnes.length}` });
      const { data } = await supabase
        .from("email_logs")
        .select("id, created_at, registration_id, email, subject, body_html, attachments, status, provider_message_id, error")
        .order("created_at", { ascending: false })
        .limit(100);
      setEmailLogs((data as EmailLog[]) || []);
    } catch (e: any) {
      setSendState({ sending: false, result: `Error: ${e?.message || e}` });
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body_html) { alert("Fill all template fields"); return; }
    const { data, error } = await supabase.from("email_templates").insert({ name: newTemplate.name, subject: newTemplate.subject, body_html: newTemplate.body_html }).select().single();
    if (!error && data) {
      setTemplates((prev) => [data as EmailTemplate, ...prev]);
      setNewTemplate({ name: "", subject: "", body_html: "" });
    }
  };

  return (
    <section className="bg-black py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Payment</h1>
          <p className="text-gray-400 text-sm">Manage registrations, payments, pricing, and email notifications.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-xs">Total Paid</div>
            <div className="text-white text-2xl font-semibold mt-1">{currency} {totalPaid.toLocaleString()}</div>
          </div>
          <div className="border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-xs">Successful Payments</div>
            <div className="text-white text-2xl font-semibold mt-1">{payments.filter(p => (p.status||"").toLowerCase()==="success").length}</div>
          </div>
          <div className="border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-xs">Total Registrations</div>
            <div className="text-white text-2xl font-semibold mt-1">{new Set(payments.map(p => p.registration_id).filter(Boolean)).size}</div>
          </div>
        </div>

        {/* Amount & Currency Settings */}
        <div className="border border-white/10 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Amount & Currency</h2>
            <button onClick={saveSettings} disabled={loadingSettings} className="px-3 py-1.5 rounded bg-[#CCFF00] text-black font-semibold disabled:opacity-60">{loadingSettings?"Saving…":"Save"}</button>
          </div>
          {settingsError && (
            <div className="text-xs text-red-300 mb-3">{settingsError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount</label>
              <input className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={settingsDraft.amount} onChange={(e)=>setSettingsDraft(s=>({...s, amount:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Currency</label>
              <select className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={settingsDraft.currency} onChange={(e)=>setSettingsDraft(s=>({...s, currency:e.target.value}))}>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GHS">GHS</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Cohort</label>
              <input
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                value={settingsDraft.current_cohort}
                onChange={(e)=>setSettingsDraft(s=>({...s, current_cohort:e.target.value}))}
                placeholder="e.g., core-3"
              />
            </div>
            <div className="text-gray-400 text-xs flex items-end">This price will be used when we add Paystack.</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="border border-white/10 rounded-lg p-4 mb-8">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Payments</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadPaymentsCsv}
                  className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10 text-white hover:bg-white/15"
                >
                  Export CSV
                </button>
                <button
                  onClick={downloadPaymentsXlsx}
                  className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10 text-white hover:bg-white/15"
                >
                  Export Excel
                </button>
                <button
                  onClick={downloadPaymentsPdf}
                  className="text-xs px-3 py-1.5 rounded bg-white/10 border border-white/10 text-white hover:bg-white/15"
                >
                  Download PDF
                </button>
                <div className="text-xs text-gray-400">Showing latest {payments.length}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr_auto] items-end gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Recipients</label>
                <select className="px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={recipientMode} onChange={(e)=>setRecipientMode(e.target.value as any)}>
                  <option value="everyone">Everyone</option>
                  <option value="selected">Selected</option>
                  <option value="one">One person</option>
                </select>
              </div>
              {recipientMode === "one" && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <input className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={singleEmail} onChange={(e)=>setSingleEmail(e.target.value)} placeholder="recipient@example.com" />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Template</label>
                <select className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={bulkTemplateId} onChange={(e)=>setBulkTemplateId(e.target.value)}>
                  <option value="">Select a template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                  ))}
                </select>
              </div>
              <button onClick={sendFromHeader} disabled={sendState.sending || !bulkTemplateId || (recipientMode==="selected" && selection.length===0)} className="px-3 py-2 rounded bg-[#CCFF00] text-black font-semibold disabled:opacity-60">{sendState.sending?"Sending…":"Send Email"}</button>
            </div>
            {recipientMode === "selected" && (
              <div className="text-xs text-gray-400">{selection.length} selected</div>
            )}
            {sendState.result && <div className="text-xs text-gray-400">{sendState.result}</div>}
            {paymentsError && <div className="text-xs text-red-300">{paymentsError}</div>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-400">
                <tr className="text-left">
                  <th className="px-2 py-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Cohort</th>
                  <th className="px-2 py-2">Institution</th>
                  <th className="px-2 py-2">Current Role</th>
                  <th className="px-2 py-2">Role Category</th>
                  <th className="px-2 py-2">Social</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Ref</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {paymentsLoading ? (
                  <tr><td colSpan={8} className="px-2 py-4 text-center text-gray-400">Loading…</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={8} className="px-2 py-4 text-center text-gray-400">No data</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-t border-white/5">
                      <td className="px-2 py-2">
                        <input type="checkbox" checked={p.registration_id ? selection.includes(p.registration_id) : false} onChange={()=>toggleSelect(p.registration_id)} />
                      </td>
                      <td className="px-2 py-2">{new Date(p.created_at).toLocaleString()}</td>
                      <td className="px-2 py-2">{`${p.registration?.first_name || ""} ${p.registration?.last_name || ""}`.trim() || "-"}</td>
                      <td className="px-2 py-2">{p.registration?.email || "-"}</td>
                      <td className="px-2 py-2">{p.registration?.cohort || "-"}</td>
                      <td className="px-2 py-2">{p.registration?.institution || "-"}</td>
                      <td className="px-2 py-2">{p.registration?.current_position || "-"}</td>
                      <td className="px-2 py-2">{p.registration?.role_category || "-"}</td>
                      <td className="px-2 py-2">
                        {p.registration?.social_url ? (
                          <a
                            href={p.registration.social_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#CCFF00] hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-2 py-2">{p.currency || "NGN"} {Number(p.amount || 0).toLocaleString()}</td>
                      <td className="px-2 py-2 capitalize">{p.status || "-"}</td>
                      <td className="px-2 py-2">{p.reference || "-"}</td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => deletePayment(p.id)}
                          disabled={deletingPaymentId === p.id}
                          className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-red-300 disabled:opacity-60"
                        >
                          {deletingPaymentId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Templates */}
        <div className="border border-white/10 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Email Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <input className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={newTemplate.name} onChange={(e)=>setNewTemplate(s=>({...s, name:e.target.value}))} placeholder="registration_success" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Subject</label>
              <input className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={newTemplate.subject} onChange={(e)=>setNewTemplate(s=>({...s, subject:e.target.value}))} placeholder="Registration Successful" />
            </div>
            <div className="flex items-end">
              <button onClick={createTemplate} className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white">Add Template</button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Body (HTML)</label>
            <textarea className="w-full min-h-[120px] px-3 py-2 rounded bg-black/40 border border-white/10 text-white" value={newTemplate.body_html} onChange={(e)=>setNewTemplate(s=>({...s, body_html:e.target.value}))} placeholder="<p>Thank you for registering...</p>" />
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-1">Existing Templates</div>
            <div className="flex flex-wrap gap-2">
              {templatesLoading ? (
                <span className="text-xs text-gray-400">Loading…</span>
              ) : templates.length === 0 ? (
                <span className="text-xs text-gray-400">No templates yet</span>
              ) : (
                templates.map(t => (
                  <span key={t.id} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs">
                    <button onClick={() => setViewTemplate(t)} className="underline underline-offset-2 hover:text-white/90">
                      {t.name}
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      disabled={deletingTemplateId === t.id}
                      className="text-red-300 hover:text-red-400 disabled:opacity-60"
                      title="Delete template"
                    >
                      {deletingTemplateId === t.id ? "…" : "×"}
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Email Logs */}
        <div className="border border-white/10 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Email Logs</h2>
            <div className="text-xs text-gray-400">Latest {emailLogs.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-400">
                <tr className="text-left">
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Subject</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Message ID</th>
                  <th className="px-2 py-2">Error</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {emailLogsLoading ? (
                  <tr><td colSpan={6} className="px-2 py-4 text-center text-gray-400">Loading…</td></tr>
                ) : emailLogs.length === 0 ? (
                  <tr><td colSpan={6} className="px-2 py-4 text-center text-gray-400">No logs</td></tr>
                ) : (
                  emailLogs.map((l) => (
                    <tr key={l.id} className="border-t border-white/5">
                      <td className="px-2 py-2">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-2 py-2">{l.email}</td>
                      <td className="px-2 py-2">{l.subject}</td>
                      <td className="px-2 py-2 capitalize">{l.status}</td>
                      <td className="px-2 py-2">{l.provider_message_id || "-"}</td>
                      <td className="px-2 py-2">{l.error || "-"}</td>
                      <td className="px-2 py-2 flex items-center gap-2">
                        <button
                          onClick={() => setViewLog(l)}
                          className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-white"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteLog(l.id)}
                          disabled={deletingLogId === l.id}
                          className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-red-300 disabled:opacity-60"
                        >
                          {deletingLogId === l.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {viewLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setViewLog(null)} />
            <div className="relative z-10 w-full max-w-2xl mx-auto bg-[#0b0b0b] border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">Email Preview</h3>
                <button onClick={() => setViewLog(null)} className="text-gray-300 hover:text-white">×</button>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <div><span className="text-gray-400">To:</span> {viewLog.email}</div>
                <div><span className="text-gray-400">Subject:</span> {viewLog.subject}</div>
                <div><span className="text-gray-400">Status:</span> {viewLog.status}</div>
              </div>
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: viewLog.body_html }} />
              </div>
            </div>
          </div>
        )}

        {viewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setViewTemplate(null)} />
            <div className="relative z-10 w-full max-w-2xl mx-auto bg-[#0b0b0b] border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">Template Preview</h3>
                <button onClick={() => setViewTemplate(null)} className="text-gray-300 hover:text-white">×</button>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <div><span className="text-gray-400">Name:</span> {viewTemplate.name}</div>
                <div><span className="text-gray-400">Subject:</span> {viewTemplate.subject}</div>
              </div>
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: viewTemplate.body_html }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
