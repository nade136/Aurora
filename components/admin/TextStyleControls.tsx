"use client";

type TextStyle = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
};

type Props = {
  value?: TextStyle;
  onChange: (next: TextStyle) => void;
  defaultColor?: string;
};

const FONT_OPTIONS = [
  { value: "", label: "Default font" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Sora, sans-serif", label: "Sora" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Manrope', sans-serif", label: "Manrope" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Urbanist', sans-serif", label: "Urbanist" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Work Sans', sans-serif", label: "Work Sans" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'PT Serif', serif", label: "PT Serif" },
  { value: "'Pacifico', cursive", label: "Pacifico (Cursive)" },
  { value: "'Dancing Script', cursive", label: "Dancing Script (Cursive)" },
  { value: "'Great Vibes', cursive", label: "Great Vibes (Cursive)" },
  { value: "'Caveat', cursive", label: "Caveat (Cursive)" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "cursive", label: "Cursive" },
  { value: "monospace", label: "Monospace" },
];

const FONT_SIZE_OPTIONS = [
  { value: "", label: "Default size" },
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "28px", label: "28px" },
  { value: "32px", label: "32px" },
  { value: "40px", label: "40px" },
  { value: "48px", label: "48px" },
  { value: "56px", label: "56px" },
  { value: "64px", label: "64px" },
];

export default function TextStyleControls({ value, onChange, defaultColor = "#ffffff" }: Props) {
  const style = value || {};

  const setStyle = (patch: Partial<TextStyle>) => {
    onChange({ ...style, ...patch });
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setStyle({ bold: !style.bold })}
        className={`px-2 py-1 text-xs rounded border ${
          style.bold ? "border-[#CCFF00] text-[#CCFF00]" : "border-white/20 text-gray-300"
        }`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => setStyle({ italic: !style.italic })}
        className={`px-2 py-1 text-xs rounded border ${
          style.italic ? "border-[#CCFF00] text-[#CCFF00]" : "border-white/20 text-gray-300"
        }`}
      >
        I
      </button>
      <input
        type="color"
        value={style.color || defaultColor}
        onChange={(e) => setStyle({ color: e.target.value })}
        className="h-8 w-10 rounded border border-white/20 bg-transparent cursor-pointer"
      />
      <select
        value={style.fontFamily || ""}
        onChange={(e) => setStyle({ fontFamily: e.target.value })}
        className="h-8 min-w-[140px] max-w-[180px] bg-transparent border border-white/20 rounded px-2 text-xs text-gray-300"
      >
        {FONT_OPTIONS.map((opt) => (
          <option key={opt.value || "default"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={style.fontSize || ""}
        onChange={(e) => setStyle({ fontSize: e.target.value })}
        className="h-8 min-w-[110px] bg-transparent border border-white/20 rounded px-2 text-xs text-gray-300"
      >
        {FONT_SIZE_OPTIONS.map((opt) => (
          <option key={opt.value || "default-size"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
