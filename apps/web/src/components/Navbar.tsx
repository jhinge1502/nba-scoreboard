"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <nav className="border-b border-slate-700 bg-slate-900 px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-white">
            NBA Scoreboard
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          {user && (
            <Link
              href="/favorites"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              My Teams
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-slate-400">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
