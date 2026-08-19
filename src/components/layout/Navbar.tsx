"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";

function NavbarComponent() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/");
  }, [signOut, router]);

  return (
    <nav className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl saturate-[180%] border-b border-white/60" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-pixel-brown pixel-text flex items-center gap-2 group">
          <span className="text-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 inline-block">🏠</span>
          <span className="tracking-wide">Playground</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <Link href="/moments" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                  Post
                </Link>
                <Link href="/articles" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                  Letters
                </Link>
                <Link href="/photos" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                  Pinterest
                </Link>
                <Link href="/countdowns" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                  Days
                </Link>
                <Link href="/footprints" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                   Foot Prints
                </Link>
                <Link href="/members" className="text-pixel-brown/70 hover:text-pixel-brown pixel-text transition-colors">
                  About us
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-pixel-pink/80 hover:text-pixel-pink pixel-text transition-colors">
                     Manage
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-pixel-brown pixel-text">
                    {profile?.nickname || "用户"}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="glass-btn px-3 py-1.5 text-xs pixel-text font-bold text-pixel-brown/70 hover:text-pixel-brown"
                >
                  退出
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="glass-btn px-4 py-2 text-sm pixel-text font-bold text-pixel-brown bg-pixel-yellow/30 hover:bg-pixel-yellow/40"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(NavbarComponent);
