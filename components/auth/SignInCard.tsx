"use client";

import { Mail, Lock, Github, LogIn, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignInCard() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = supabaseBrowser();
    const emailNormalized = email.trim().toLowerCase();
    const passwordNormalized = password.trim();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailNormalized, password: passwordNormalized });
    setLoading(false);
    if (error) {
      console.error("Sign-in error:", error);
      setError(error.message || "Sign in failed");
      return;
    }
    const dest = search.get("redirectedFrom") || "/admin/dashboard";
    router.replace(dest);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-[#0f0f0f]/90 backdrop-blur p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        <div className="mb-6">
          <div className="w-10 h-10 rounded bg-[#CCFF00]" />
          <h1 className="text-2xl font-bold mt-4">Sign in to Aurora</h1>
          <p className="text-sm text-gray-400 mt-1">
            Access the admin dashboard.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm text-gray-300">
            Email
            <div className="mt-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </label>

          <label className="block text-sm text-gray-300">
            Password
            <div className="mt-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-transparent outline-none text-sm w-full"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 text-black bg-[#CCFF00] hover:bg-[#b8e600] font-semibold px-3 py-2 rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        
      </div>
    </div>
  );
}
