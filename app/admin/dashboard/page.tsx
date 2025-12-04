export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{"label":"Pages","value":"6"},{"label":"Drafts","value":"3"},{"label":"Media","value":"42"},{"label":"Users","value":"2"}].map((c)=> (
          <div key={c.label} className="rounded-xl border border-white/10 bg-[#111] p-4">
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-gray-400 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-[#111] p-4">
          <div className="font-semibold mb-3">Recent activity</div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Edited Reviews page hero</li>
            <li>Published Statistics section</li>
            <li>Uploaded 3 media assets</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#111] p-4">
          <div className="font-semibold mb-3">Shortcuts</div>
          <div className="flex flex-wrap gap-2">
            {[
              {label:"Edit Reviews", href:"/admin/pages?slug=reviews"},
              {label:"Media Library", href:"/admin/media"},
              {label:"Site Settings", href:"/admin/settings"},
            ].map(b=> (
              <a key={b.label} href={b.href} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-sm">{b.label}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
