"use client";

import { useState } from "react";
import ThemeScene from "@/components/home/ThemeScene";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import Link from "next/link";
import { ThemeType, themes } from "@/lib/themes";

const ENTRIES = [
  { href: "/moments",    icon: "📝", label: "Post",         emoji: "💭" },
  { href: "/articles",   icon: "📖", label: "Letters",      emoji: "💌" },
  { href: "/photos",     icon: "🖼️", label: "Pinterest",    emoji: "🌷" },
  { href: "/countdowns", icon: "⏳", label: "Days",         emoji: "✨" },
  { href: "/footprints", icon: "🗺️", label: "Foot Prints",  emoji: "🚶" },
  { href: "/members",    icon: "👥", label: "About us",     emoji: "🤍" },
];

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeType>("birthday");
  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 page-theme-bg">
      {/* ============= 顶部主题插画区 ============= */}
      <section className="w-full max-w-3xl mb-8 animate-float-up">
        <ThemeScene theme={theme} />
      </section>

      {/* ============= 欢迎区域 ============= */}
      <section className="text-center mb-12 animate-float-up animate-float-up-delay-1">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-pixel-pink/80 text-xs pixel-text tracking-widest">· MEMORY · SPACE ·</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-pixel-brown pixel-display leading-tight">
          Welcome Home
        </h1>
        <p className="mt-5 text-base md:text-lg text-pixel-brown/70 max-w-md mx-auto pixel-text leading-[2]">
          <br />
          <span className="text-pixel-brown/50 text-sm">— Our Playground —</span>
        </p>
      </section>

      {/* ============= 功能入口 ============= */}
      <section className="w-full max-w-2xl animate-float-up animate-float-up-delay-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {ENTRIES.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`glass-card glass-hover p-5 sm:p-6 flex flex-col items-center gap-2 group animate-float-up animate-float-up-delay-${
                (i % 6) + 1
              }`}
            >
              <div className="relative">
                <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 inline-block">
                  {item.icon}
                </span>
                <span className="absolute -top-1 -right-3 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1 translate-y-1">
                  {item.emoji}
                </span>
              </div>
              <span className="font-bold text-pixel-brown pixel-text text-sm sm:text-[15px] tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============= 主题切换按钮区 ============= */}
      <section className="mt-20 w-full max-w-xl animate-float-up animate-float-up-delay-5">
        <div className="glass-card py-5 px-4 sm:px-6">
          <p className="text-center text-[11px] pixel-text text-pixel-brown/50 mb-3 tracking-widest">
            ✦  CHOOSE  A  VIBE  ✦
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {(Object.keys(themes) as ThemeType[]).map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`glass-btn px-4 py-2 text-xs sm:text-sm pixel-text font-bold transition-all ${
                    active
                      ? "!bg-gradient-to-br !from-pixel-pink/40 !to-pixel-yellow/40 !shadow-[0_8px_24px_-4px_rgba(232,96,136,0.35)]"
                      : ""
                  }`}
                >
                  {themes[t].displayName}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============= 底部页脚 ============= */}
      <footer className="mt-14 text-center pb-4 animate-float-up animate-float-up-delay-6">
        <div className="flex justify-center gap-3 mb-4 items-end">
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <Bunny size={46} />
          </div>
          <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-pixel-pink/40 via-pixel-yellow/50 to-pixel-pink/40 mb-4" />
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <Hamster size={50} />
          </div>
        </div>
        <p className="pixel-text text-[11px] text-pixel-brown/45 tracking-widest">
          POWERED  BY  o2  ·  PLAYGROUND
        </p>
      </footer>
    </main>
  );
}
