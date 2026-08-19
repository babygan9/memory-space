"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CreateMomentForm from "@/components/moments/CreateMomentForm";
import { getMoments, groupMomentsByMonth, formatDate } from "@/lib/api";
import { getDisplayFromProfile } from "@/lib/userDisplay";
import SafeImage from "@/components/ui/SafeImage";
import type { Moment } from "@/types/database";

export default function MomentsList() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadMoments = useCallback(async () => {
    setLoading(true);
    const data = await getMoments();
    setMoments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  const groupedMoments = useMemo(() => groupMomentsByMonth(moments), [moments]);
  const sortedMonths = useMemo(
    () => Object.keys(groupedMoments).sort((a, b) => b.localeCompare(a)),
    [groupedMoments]
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 page-theme-bg">
          {/* 标题区域 */}
          <div className="flex items-end justify-between mb-8 animate-float-up">
            <div>
              <p className="text-[11px] pixel-text text-pixel-pink/70 tracking-widest mb-2">
                · DAILY · MOMENTS ·
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-pixel-brown pixel-display leading-tight">
                📝 Post
              </h1>
              <p className="text-sm text-pixel-brown/55 pixel-text mt-2 leading-relaxed">
                
                {!loading && moments.length > 0 && (
                  <span className="ml-2 text-pixel-pink/70">· 共 {moments.length} 条</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="glass-btn px-5 py-2.5 font-bold text-pixel-brown pixel-text text-sm transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFE866 0%, #FF9EBD 100%)",
                boxShadow: "0 4px 14px rgba(255,107,157,0.25)",
              }}
            >
              + 发布
            </button>
          </div>

          {/* 发布表单弹窗 */}
          {showCreateForm && (
            <CreateMomentForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false);
                loadMoments();
              }}
            />
          )}

          {/* 加载状态 - 骨架屏卡片 */}
          {loading && (
            <div className="space-y-10">
              {[1, 2].map((gi) => (
                <div key={gi}>
                  <h2 className="text-lg font-bold text-pixel-brown pixel-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pixel-pink/50 skeleton-shimmer" />
                    <span className="h-5 w-24 skeleton-shimmer rounded" />
                  </h2>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <MomentCardSkeleton key={i} delay={gi * 60 + i * 40} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && moments.length === 0 && (
            <div
              className="text-center py-20 animate-float-up relative overflow-hidden rounded-[28px]"
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full"
                style={{ background: "rgba(255,183,197,0.2)", filter: "blur(30px)" }}
              />
              <div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                style={{ background: "rgba(255,217,61,0.2)", filter: "blur(30px)" }}
              />
              <div className="relative">
                <div
                  className="glass-card inline-block p-8 mb-4 rounded-[24px]"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "2px dashed rgba(255,107,157,0.3)",
                  }}
                >
                  <div className="text-6xl mb-2">📝</div>
                </div>
                <p className="text-pixel-brown/75 pixel-text text-lg mb-2">还没有 Post</p>
                <p className="text-sm text-pixel-brown/50 pixel-text leading-relaxed">
                  点击右上角「发布」按钮<br />
                  记录第一个美好瞬间吧 ✨
                </p>
              </div>
            </div>
          )}

          {/* 时间归档列表 */}
          {!loading && moments.length > 0 && (
            <div className="space-y-14">
              {sortedMonths.map((monthKey, monthIdx) => {
                const [year, month] = monthKey.split("-");
                const count = groupedMoments[monthKey].length;
                return (
                  <div key={monthKey} className="animate-float-up" style={{ animationDelay: `${80 + monthIdx * 120}ms` }}>
                    {/* 年月标题 - 胶囊式渐变徽章 */}
                    <div className="mb-6 flex items-center gap-3">
                      <div
                        className="px-5 py-2 rounded-full flex items-center gap-2.5 relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #FFE866 0%, #FF9EBD 100%)",
                          boxShadow: "0 4px 12px rgba(255,107,157,0.2)",
                        }}
                      >
                        <span className="text-sm font-bold text-white pixel-text">
                          {year} · {parseInt(month)}月
                        </span>
                        <span
                          className="px-2 py-0.5 text-[10px] rounded-full pixel-text font-bold"
                          style={{ background: "rgba(255,255,255,0.35)", color: "#fff" }}
                        >
                          {count}
                        </span>
                      </div>
                      <span className="h-px flex-1 bg-gradient-to-r from-pixel-pink/30 via-pixel-yellow/40 to-transparent" />
                    </div>

                    {/* 该月的记录列表 */}
                    <div className="space-y-5">
                      {groupedMoments[monthKey].map((moment, mIdx) => (
                        <MomentCard key={moment.id} moment={moment} delay={mIdx * 70} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Post卡片
const MomentCard = memo(function MomentCard({
  moment,
  delay = 0,
}: {
  moment: Moment;
  delay?: number;
}) {
  const display = useMemo(() => getDisplayFromProfile(moment.profiles), [moment.profiles]);
  const hasEdit = (moment.edit_history?.length ?? 0) > 0;
  return (
    <Link href={`/moments/${moment.id}`} className="block group">
      <article
        className="glass-card p-5 sm:p-6 rounded-[28px] relative overflow-hidden transition-all duration-300 hover:scale-[1.005] animate-float-up"
        style={{
          animationDelay: `${delay}ms`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pixel-yellow via-pixel-pink/60 to-pixel-yellow/40" />

        {/* 角落装饰 */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full transition-opacity group-hover:opacity-80"
          style={{
            background: "rgba(255,183,197,0.15)",
            filter: "blur(24px)",
            opacity: 0.5,
          }}
        />

        {/* 作者和日期 */}
        <header className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base relative"
              style={{
                background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                boxShadow: "0 3px 8px rgba(255,217,61,0.35)",
              }}
            >
              {display.avatar}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold text-pixel-brown pixel-text">
                {display.nickname}
              </span>
              <span className="text-[10px] text-pixel-brown/40 pixel-text tracking-wider mt-0.5 flex items-center gap-1.5">
                📅 {formatDate(moment.created_at)}
                {hasEdit && (
                  <span className="text-pixel-pink/70 bg-pixel-pink/10 px-1.5 py-0.5 rounded">
                    · 已编辑
                  </span>
                )}
              </span>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
            style={{
              background: "rgba(255,107,157,0.1)",
            }}
          >
            <span className="text-pixel-pink text-base group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </header>

        {/* 文字内容 */}
        <p className="text-pixel-brown/92 pixel-text whitespace-pre-wrap mb-5 leading-[1.9] text-[15px] relative">
          {moment.content}
        </p>

        {/* Photo网格 */}
        {moment.photos && moment.photos.length > 0 && (
          <div
            className={`grid gap-2.5 ${
              moment.photos.length === 1
                ? "grid-cols-1"
                : moment.photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {moment.photos.slice(0, 9).map((photo) => (
              <div
                key={photo.id}
                className="aspect-square overflow-hidden relative group/photo"
                style={{
                  borderRadius: "20px",
                  border: "3px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                }}
              >
                <SafeImage src={photo.url} alt="" className="transition-transform duration-500 group-hover/photo:scale-105" />
              </div>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
});

// Post卡片骨架屏
const MomentCardSkeleton = memo(function MomentCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass-card p-5 rounded-[28px] animate-float-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 作者和日期 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer" />
          <div className="space-y-1.5">
            <div className="h-4 w-20 skeleton-shimmer rounded" />
            <div className="h-2.5 w-24 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-full skeleton-shimmer" />
      </div>

      {/* 文字内容骨架 */}
      <div className="space-y-2.5 mb-5">
        <div className="h-3.5 w-full skeleton-shimmer rounded" />
        <div className="h-3.5 w-5/6 skeleton-shimmer rounded" />
        <div className="h-3.5 w-2/3 skeleton-shimmer rounded" />
      </div>

      {/* Photo网格骨架 */}
      <div className="grid grid-cols-3 gap-2.5">
        <div
          className="aspect-square skeleton-shimmer"
          style={{ borderRadius: "20px" }}
        />
        <div
          className="aspect-square skeleton-shimmer"
          style={{ borderRadius: "20px" }}
        />
        <div
          className="aspect-square skeleton-shimmer"
          style={{ borderRadius: "20px" }}
        />
      </div>
    </div>
  );
});
