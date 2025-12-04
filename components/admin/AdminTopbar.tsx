"use client";

import { LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

export default function AdminTopbar() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    setSigningOut(false);
    router.replace("/auth/sign-in");
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur sticky top-0 z-20 flex items-center">
      <div className="flex-1 px-4 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 w-[360px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full" placeholder="Search pages, media..." />
        </div>
      </div>
      <div className="px-4 flex items-center gap-3">
        <button className="text-xs font-semibold text-black bg-[#CCFF00] hover:bg-[#b8e600] px-3 py-1.5 rounded-md transition">
          Save Draft
        </button>
        <button onClick={onSignOut} disabled={signingOut} className="flex items-center gap-2 text-gray-300 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 disabled:opacity-60">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
