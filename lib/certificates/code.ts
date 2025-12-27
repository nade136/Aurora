export type CertInput = {
  companyPrefix: string; // e.g., AURORA
  cohort: string; // e.g., CORE2
  fullName: string; // student full name
  issuedAt: Date; // issuance date
  seq?: number; // optional sequence override
};

const onlyLetters = (s: string) => (s.normalize('NFKD').replace(/[^A-Za-z]/g, '').toUpperCase());

const pad3 = (n: number) => String(n).padStart(3, '0');

const toYYMM = (d: Date) => {
  const yy = String(d.getUTCFullYear()).slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yy}${mm}`;
};

// Simple 32-bit hash (FNV-1a)
function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

const toBase36 = (n: number) => n.toString(36).toUpperCase();

/**
 * Generate a human-friendly certificate code in the format:
 * AURORA-<COHORT>-<NAM3>-<YYMM>-<SEQ>-<CHK>
 * - NAM3: first three letters of normalized name (pad with X if < 3)
 * - YYMM: issuance year+month in UTC
 * - SEQ: 001..999 (caller decides sequencing per cohort+month+name)
 * - CHK: two base36 chars from a hash to catch typos
 */
export function generateCertificateCode(input: CertInput & { seq: number }): string {
  const pref = onlyLetters(input.companyPrefix) || 'AURORA';
  const cohort = input.cohort.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const norm = onlyLetters(input.fullName);
  const nam3 = (norm + 'XXX').slice(0, 3);
  const yymm = toYYMM(input.issuedAt);
  const seqStr = pad3(Math.max(1, Math.min(999, input.seq)));
  const chkSource = `${pref}|${cohort}|${norm}|${yymm}|${seqStr}`;
  const chk = toBase36(hash32(chkSource) % 1296).padStart(2, '0').slice(-2);
  return `${pref}-${cohort}-${nam3}-${yymm}-${seqStr}-${chk}`;
}

export type PreviewRow = {
  name: string;
  email: string;
  position?: string;
  cohort: string;
  issuedAt: Date;
  seq: number;
};

export function previewCodes(companyPrefix: string, rows: PreviewRow[]): { row: PreviewRow; code: string }[] {
  return rows.map((row) => ({
    row,
    code: generateCertificateCode({ companyPrefix, cohort: row.cohort, fullName: row.name, issuedAt: row.issuedAt, seq: row.seq })
  }));
}
