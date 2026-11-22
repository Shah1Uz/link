"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, ArrowRight, RotateCcw, UserCheck } from "lucide-react";

export function SignInHelper() {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const [isClearing, setIsClearing] = useState(false);

  const handleFullLogout = async () => {
    setIsClearing(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}

    try {
      const cookieNames = [
        "biospace_session",
        "__session",
        "__client_uat",
        "__clerk_db_jwt",
        "__clerk_handshake",
      ];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        if (typeof window !== "undefined" && window.location.hostname) {
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        }
      });
    } catch {}

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    try {
      if (signOut) {
        await signOut({ redirectUrl: "/sign-in" });
        return;
      }
    } catch {}

    window.location.replace("/sign-in");
  };

  if (isSignedIn) {
    return (
      <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-white shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <UserCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">
              Tizimga kirilgan: {user?.primaryEmailAddress?.emailAddress || user?.username || "Faol hisob"}
            </p>
            <p className="text-[11px] text-zinc-300">
              Boshqa hisobdan kirish uchun avval tizimdan chiqing.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={isClearing}
            onClick={handleFullLogout}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/30 disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isClearing ? "Chiqilmoqda…" : "Hisobdan chiqish"}</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition-colors hover:bg-emerald-400"
          >
            <span>Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center justify-center">
      <button
        type="button"
        disabled={isClearing}
        onClick={handleFullLogout}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:text-emerald-400 cursor-pointer disabled:opacity-50"
      >
        <RotateCcw className="h-3 w-3" />
        <span>{isClearing ? "Sessiya tozalanmoqda…" : "Boshqa hisobdan kirishda muammo bo'lsa: Sessiyani tozalash"}</span>
      </button>
    </div>
  );
}
