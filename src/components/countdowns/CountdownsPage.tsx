"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import { getCountdowns } from "@/lib/api";
import type { Countdown } from "@/types/database";

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; numBg: string; numGlow: string; accent: string }> = {
  pink: {
    bg: "from-pink-100/80 via-pink-50/70 to-rose-50/80",
    text: "text-pink-700",
    border: "border-pink-200",
    numBg: "from-pink-500 to-rose-500",
    numGlow: "rgba(244,114,182,0.35)",
    accent: "#F472B6",
  },
  blue: {
    bg: "from-sky-100/80 via-blue-50/70 to-indigo-50/80",
    text: "text-blue-700",
    border: "border-blue-200",
    numBg: "from-blue-500 to-indigo-500",
    numGlow: "rgba(59,130,246,0.35)",
    accent: "#3B82F6",
  },
  green: {
    bg: "from-emerald-100/80 via-green-50/70 to-teal-50/80",
    text: "text-emerald-700",
    border: "border-emerald-200",
    numBg: "from-emerald-500 to-teal-500",
    numGlow: "rgba(16,185,129,0.35)",
    accent: "#10B981",
  },
  purple: {
    bg: "from-purple-100/80 via-violet-50/70 to-indigo-50/80",
    text: "text-purple-700",
    border: "border-purple-200",
    numBg: "from-purple-500 to-violet-500",
    numGlow: "rgba(168,85,247,0.35)",
    accent: "#A855F7",
  },
  orange: {
    bg: "from-orange-100/80 via-amber-50/70 to-yellow-50/80",
    text: "text-orange-700",
    border: "border-orange-200",
    numBg: "from-orange-500 to-amber-500",
    numGlow: "rgba(249,115,22,0.35)",
    accent: "#F97316",
  },
  yellow: {
    bg: "from-yellow-100/80 via-amber-50/70 to-yellow-50/80",
    text: "text-amber-700",
    border: "border-amber-200",
    numBg: "from-amber-500 to-yellow-500",
    numGlow: "rgba(245,158,11,0.35)",
    accent: "#F59E0B",
  },
};

function calcDays(targetDateStr: string): { days: number; isPast: boolean; isToday: boolean } {
  const target = new Date(targetDateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    days: Math.abs(diffDays),
    isPast: diffDays < 0,
    isToday: diffDays === 0,
  };
}

function formatDateStr(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${y}.${m}.${day} ${weekdays[d.getDay()]}`;
}

export default function CountdownsPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getCountdowns();
    setCountdowns(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 按状态分组统计
  const stats = useMemo(() => {
    const upcoming = countdowns.filter((cd) => !calcDays(cd.target_date).isPast && !calcDays(cd.target_date).isToday);
    const today = countdowns.filter((cd) => calcDays(cd.target_date).isToday);
    const past = countdowns.filter((cd) => calcDays(cd.target_date).isPast);
    return { upcoming: upcoming.length, today: today.length, past: past.length };
  }, [countdowns]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream-100">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8 animate-float-up">
              <div>
                <h1 className="text-3xl font-bold text-pixel-brown pixel-text flex items-center gap-2">
                  <span>📅</span> Days
                </h1>
                <p className="text-sm text-pixel-brown/60 pixel-text mt-1.5">记录每一个重要的日子</p>
              </div>
              <div className="flex gap-1">
                <Bunny size={50} />
                <Hamster size={55} />
              </div>
            </div>

            {/* 统计骨架 */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 rounded-[22px] skeleton-shimmer h-16" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="glass-card p-6 h-44 skeleton-shimmer rounded-[28px] animate-float-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream-100">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-8 animate-float-up">
            <div>
              <h1 className="text-3xl font-bold text-pixel-brown pixel-text flex items-center gap-2">
                <span>📅</span> Days
              </h1>
              <p className="text-sm text-pixel-brown/60 pixel-text mt-1.5">
                
                {countdowns.length > 0 && <span className="ml-2">· 共 {countdowns.length} 个</span>}
              </p>
            </div>
            <div className="flex gap-1">
              <Bunny size={50} />
              <Hamster size={55} />
            </div>
          </div>

          {/* 统计概览 */}
          {countdowns.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div
                className="glass-card p-4 rounded-[22px] text-center animate-float-up relative overflow-hidden"
                style={{ animationDelay: "30ms" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-sky-400" />
                <p className="text-xs text-pixel-brown/50 pixel-text mb-1">⏳ 即将到来</p>
                <p className="text-2xl font-bold pixel-text text-blue-600">{stats.upcoming}</p>
              </div>
              <div
                className="glass-card p-4 rounded-[22px] text-center animate-float-up relative overflow-hidden"
                style={{ animationDelay: "60ms" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-red-400" />
                <p className="text-xs text-pixel-brown/50 pixel-text mb-1">🎊 就是今天</p>
                <p className="text-2xl font-bold pixel-text text-rose-500">{stats.today}</p>
              </div>
              <div
                className="glass-card p-4 rounded-[22px] text-center animate-float-up relative overflow-hidden"
                style={{ animationDelay: "90ms" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-400" />
                <p className="text-xs text-pixel-brown/50 pixel-text mb-1">✨ 已过纪念</p>
                <p className="text-2xl font-bold pixel-text text-amber-600">{stats.past}</p>
              </div>
            </div>
          )}

          {countdowns.length === 0 ? (
            <div className="glass-card rounded-[28px] p-16 text-center animate-float-up">
              <div className="text-6xl mb-5">🎈</div>
              <p className="text-pixel-brown/60 pixel-text mb-2 text-lg">还没有Days哦</p>
              <p className="text-pixel-brown/40 pixel-text text-sm">请联系管理员添加值得纪念的日子吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countdowns.map((cd, i) => {
                const colors = COLOR_MAP[cd.color] || COLOR_MAP.pink;
                const { days, isPast, isToday } = calcDays(cd.target_date);
                // 重要程度：越接近今天的越大
                const priorityBadge =
                  isToday ? { label: "就是今天", bg: "from-pink-500 to-rose-500", glow: "rgba(244,63,94,0.5)" } :
                  !isPast && days <= 7 ? { label: "一周内", bg: "from-red-500 to-orange-500", glow: "rgba(249,115,22,0.45)" } :
                  !isPast && days <= 30 ? { label: "一月内", bg: "from-amber-500 to-yellow-500", glow: "rgba(245,158,11,0.45)" } :
                  isPast ? { label: "已纪念", bg: "from-gray-400 to-gray-500", glow: "rgba(156,163,175,0.3)" } :
                  null;

                return (
                  <div
                    key={cd.id}
                    className={`relative overflow-hidden rounded-[28px] border-2 ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-md p-6 transition-all duration-300 hover:scale-[1.02] animate-float-up`}
                    style={{
                      animationDelay: `${120 + i * 70}ms`,
                      boxShadow: `0 8px 24px ${colors.numGlow}, 0 2px 8px rgba(0,0,0,0.04)`,
                    }}
                  >
                    {/* 装饰性圆点 */}
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
                      style={{ background: colors.accent, opacity: 0.12, filter: "blur(20px)" }}
                    />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full"
                      style={{ background: colors.accent, opacity: 0.08, filter: "blur(24px)" }}
                    />
                    {/* 装饰性线条 */}
                    <div
                      className="absolute top-4 right-4 w-12 h-0.5 rounded-full"
                      style={{ background: colors.accent, opacity: 0.3 }}
                    />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.6)",
                              backdropFilter: "blur(6px)",
                              border: `2px solid ${colors.accent}33`,
                              boxShadow: `0 3px 10px ${colors.numGlow}`,
                            }}
                          >
                            {cd.icon}
                          </div>
                          <h3 className={`font-bold text-lg ${colors.text} pixel-text break-words leading-tight`}>
                            {cd.title}
                          </h3>
                        </div>
                        <p className="text-xs text-pixel-brown/50 pixel-text mb-2">
                          📆 {formatDateStr(cd.target_date)}
                        </p>

                        {/* 紧急程度徽章 */}
                        {priorityBadge && (
                          <div
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full pixel-text text-[10px] font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${priorityBadge.bg.includes("from-") ? "" : priorityBadge.bg})`,
                              // 直接通过 style 设置渐变色
                              backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: "#fff",
                                boxShadow: `0 0 6px ${priorityBadge.glow}`,
                                animation: isToday || (priorityBadge.label === "一周内") ? "pulse-glow 1.2s infinite" : "none",
                              }}
                            />
                            {priorityBadge.label}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0">
                        {isToday ? (
                          <div
                            className="text-white rounded-[20px] px-5 py-3.5 animate-float-up"
                            style={{
                              background: "linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #F43F5E 100%)",
                              boxShadow: "0 6px 18px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                            }}
                          >
                            <p className="text-2xl font-bold pixel-text whitespace-nowrap">🎊 今天</p>
                          </div>
                        ) : (
                          <div
                            className={`text-white rounded-[20px] px-5 py-3.5 bg-gradient-to-br ${colors.numBg}`}
                            style={{
                              boxShadow: `0 6px 20px ${colors.numGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                              opacity: isPast ? 0.85 : 1,
                            }}
                          >
                            <p className="text-4xl font-bold pixel-text leading-none text-center">
                              {days}
                              <span className="text-lg ml-1 font-normal opacity-90">天</span>
                            </p>
                            <p className="text-xs pixel-text mt-1 opacity-85 text-center whitespace-nowrap">
                              {isPast ? "已经过了" : "还有"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        {/* 注入脉动 keyframes */}
        <style jsx global>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.75; transform: scale(1.2); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.25s ease-out forwards;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
