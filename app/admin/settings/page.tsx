export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-4">
        <div className="font-medium">Site</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm text-gray-300">Site name
            <input className="block mt-1 w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm" placeholder="Aurora" />
          </label>
          <label className="text-sm text-gray-300">Primary color
            <input type="color" defaultValue="#CCFF00" className="block mt-1 w-20 h-9 bg-transparent border border-white/10 rounded-md" />
          </label>
        </div>
        <div>
          <button className="text-xs font-semibold text-black bg-[#CCFF00] hover:bg-[#b8e600] px-3 py-1.5 rounded-md transition">Save</button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#111] p-4">
        <div className="font-medium mb-2">Users</div>
        <div className="text-sm text-gray-400">Role management will go here.</div>
      </div>
    </div>
  );
}
