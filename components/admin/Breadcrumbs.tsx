"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return null;

  const parts = pathname.split("/").filter(Boolean);
  // Only show for admin routes
  if (parts[0] !== "admin") return null;

  const items = [] as Array<{ href: string; label: string; last: boolean }>;
  let hrefAcc = "";
  for (let i = 0; i < parts.length; i++) {
    hrefAcc += `/${parts[i]}`;
    const last = i === parts.length - 1;
    const raw = parts[i];
    const label = raw
      .replace(/\[|\]/g, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
    items.push({ href: hrefAcc, label, last });
  }

  return (
    <nav className="px-4 md:px-6 py-2 border-b border-white/10 bg-transparent">
      <ol className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
        {items.map((it, idx) => (
          <li key={it.href} className="flex items-center gap-2">
            {it.last ? (
              <span className="text-gray-200 font-medium truncate max-w-[12rem] md:max-w-none">{it.label}</span>
            ) : (
              <Link href={it.href} className="hover:text-white transition truncate max-w-[12rem] md:max-w-none">
                {it.label}
              </Link>
            )}
            {idx < items.length - 1 && <span className="opacity-50">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
