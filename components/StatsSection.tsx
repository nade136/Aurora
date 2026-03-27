import React from "react";

type StatItem = {
  label: string;
  value: string;
  subtext?: string;
  valueStyle?: TextStyle;
  labelStyle?: TextStyle;
  subtextStyle?: TextStyle;
};
type TextStyle = { bold?: boolean; italic?: boolean; color?: string; fontFamily?: string; fontSize?: string };

type StatsSectionProps = {
  badge?: string;
  titleLine1?: string;
  titleLine2?: string;
  badgeStyle?: TextStyle;
  titleLine1Style?: TextStyle;
  titleLine2Style?: TextStyle;
  items?: StatItem[];
};

const defaultItems: StatItem[] = [
  { value: "12", label: "Universities Reached", subtext: "" },
  { value: "50+", label: "Cohort 1 Students", subtext: "" },
  { value: "15", label: "Projects Delivered", subtext: "" },
];

export default function StatsSection({
  badge = "STATISTICS",
  titleLine1 = "WE HAVE THE",
  titleLine2 = "NUMBERS",
  badgeStyle,
  titleLine1Style,
  titleLine2Style,
  items = defaultItems,
}: StatsSectionProps) {
  const normalizedItems = items
    .filter((item) => (item.value || "").trim() || (item.label || "").trim())
    .slice(0, 3);
  const safeItems = normalizedItems.length === 3
    ? normalizedItems
    : [...normalizedItems, ...defaultItems.slice(normalizedItems.length)].slice(0, 3);

  return (
    <section className="px-6 py-20 bg-black">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block px-4 py-2 rounded-md bg-[#2D3B00] text-[#CCFF00] text-xs font-semibold tracking-wider">
            <span
              className={`${badgeStyle?.bold ? "font-bold" : ""} ${badgeStyle?.italic ? "italic" : ""}`}
              style={{ color: badgeStyle?.color || undefined, fontFamily: badgeStyle?.fontFamily || undefined, fontSize: badgeStyle?.fontSize || undefined }}
            >
              {badge}
            </span>
          </span>
          <h2 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.95]">
            <span
              className={`${titleLine1Style?.bold ? "font-bold" : ""} ${titleLine1Style?.italic ? "italic" : ""}`}
              style={{ color: titleLine1Style?.color || undefined, fontFamily: titleLine1Style?.fontFamily || undefined, fontSize: titleLine1Style?.fontSize || undefined }}
            >
              {titleLine1}
            </span>
            <br />
            <span
              className={`${titleLine2Style?.bold ? "font-bold" : ""} ${titleLine2Style?.italic ? "italic" : ""}`}
              style={{ color: titleLine2Style?.color || undefined, fontFamily: titleLine2Style?.fontFamily || undefined, fontSize: titleLine2Style?.fontSize || undefined }}
            >
              {titleLine2}
            </span>
          </h2>
        </div>

        <div className="lg:col-span-2">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-8 md:gap-12">
            {safeItems.map((item, idx) => (
              <React.Fragment key={`${item.label}-${idx}`}>
                <div className="flex flex-col items-center text-center min-w-[160px]">
                  <div
                    className={`text-white text-5xl md:text-6xl font-bold ${item.valueStyle?.bold ? "font-bold" : ""} ${item.valueStyle?.italic ? "italic" : ""}`}
                    style={{ color: item.valueStyle?.color || undefined, fontFamily: item.valueStyle?.fontFamily || undefined, fontSize: item.valueStyle?.fontSize || undefined }}
                  >
                    {item.value}
                  </div>
                  <div
                    className={`text-gray-400 text-sm md:text-base mt-2 ${item.labelStyle?.bold ? "font-bold" : ""} ${item.labelStyle?.italic ? "italic" : ""}`}
                    style={{ color: item.labelStyle?.color || undefined, fontFamily: item.labelStyle?.fontFamily || undefined, fontSize: item.labelStyle?.fontSize || undefined }}
                  >
                    {item.label}
                  </div>
                </div>
                {idx < safeItems.length - 1 ? (
                  <div className="hidden md:block h-10 w-px bg-white/20" />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
