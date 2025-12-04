import Image from "next/image";

const GOLD = "#D4AF37";

export type RewardItem = {
  key: string;
  title: string;
  quote?: string;
  icon?: string; // full URL
  name: string;
  portrait?: string; // full URL
  description?: string;
};

function PortraitCard({ src }: { src: string }) {
  return (
    <div className="inline-block rounded-2xl p-1" style={{ boxShadow: `0 0 0 2px ${GOLD}` }}>
      <div className="rounded-xl p-1 bg-[#0f0f0f]" style={{ boxShadow: "inset 0 0 0 2px white" }}>
        <div className="w-[360px] h-[420px] rounded-lg overflow-hidden bg-[#111]">
          <Image src={src} alt="Portrait" width={360} height={420} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function RewardCard({ item }: { item: RewardItem }) {
  return (
    <section className="py-16 text-center">
      <div className="flex justify-center"><div className="h-[2px] w-24 bg-white/30" /></div>
      {item.icon && (
        <div className="mt-6 flex justify-center">
          <Image src={item.icon} alt={item.title} width={520} height={520} className="w-[300px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-auto mx-auto block" />
        </div>
      )}
      {item.quote && <p className="text-gray-400 text-sm italic max-w-xl mx-auto mt-6">“{item.quote}”</p>}
      <div className="mt-6 flex justify-center"><div className="h-[3px] w-24 rounded-full" style={{ backgroundColor: GOLD }} /></div>
      <h2 className="mt-4 font-extrabold uppercase" style={{ color: GOLD, letterSpacing: "0.06em", fontSize: "28px" }}>{item.title}</h2>

      <div className="mt-8 flex items-end justify-center gap-6">
        <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: GOLD + "33" }}>
          <span className="text-black" style={{ color: GOLD }}>‹</span>
        </button>
        {item.portrait && <PortraitCard src={item.portrait} />}
        <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: GOLD + "33" }}>
          <span className="text-black" style={{ color: GOLD }}>›</span>
        </button>
      </div>

      <div className="mt-4 text-white font-semibold tracking-wide">{item.name}</div>
      {item.description && (
        <p className="mt-6 text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">{item.description}</p>
      )}
    </section>
  );
}
