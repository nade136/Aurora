"use client";

import { useMemo, useState } from "react";
import TextStyleControls from "@/components/admin/TextStyleControls";

type TextStyle = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
};

export default function AdminInputStyler({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<TextStyle>({});

  const cssVars = useMemo(
    () =>
      ({
        "--admin-input-font-family": style.fontFamily || "inherit",
        "--admin-input-font-size": style.fontSize || "inherit",
        "--admin-input-font-weight": style.bold ? "700" : "400",
        "--admin-input-font-style": style.italic ? "italic" : "normal",
        "--admin-input-color": style.color || "inherit",
      }) as React.CSSProperties,
    [style]
  );

  return (
    <div className="admin-input-style" style={cssVars}>
      <div className="mb-4 rounded-lg border border-white/10 bg-[#111] p-3">
        <div className="text-xs text-gray-400 mb-2">Global Text Input Style (Admin)</div>
        <TextStyleControls value={style} onChange={setStyle} defaultColor="#ffffff" />
      </div>
      {children}
    </div>
  );
}
