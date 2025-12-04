const PAGES = [
  { title: "Home", slug: "home" },
  { title: "Services", slug: "services" },
  { title: "Reviews", slug: "reviews" },
  { title: "Rewards", slug: "rewards" },
  { title: "FAQ", slug: "faq" },
];

export default function PagesListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pages</h1>
        <button className="text-xs font-semibold text-black bg-[#CCFF00] hover:bg-[#b8e600] px-3 py-1.5 rounded-md transition">New Page</button>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#111] divide-y divide-white/10">
        {PAGES.map((p) => (
          <div key={p.slug} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-gray-400">/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/admin/pages/${p.slug}`} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-sm">Edit</a>
              <button className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-sm">Duplicate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
