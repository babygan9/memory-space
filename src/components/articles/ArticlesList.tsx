"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CreateArticleForm from "@/components/articles/CreateArticleForm";
import {
  getArticles,
  groupArticlesByMonth,
  formatDate,
} from "@/lib/api";
import { getDisplayFromProfile } from "@/lib/userDisplay";
import SafeImage from "@/components/ui/SafeImage";
import type { Article } from "@/types/database";

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await getArticles();
    setArticles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const groupedArticles = useMemo(() => groupArticlesByMonth(articles), [articles]);
  const sortedMonths = useMemo(
    () => Object.keys(groupedArticles).sort((a, b) => b.localeCompare(a)),
    [groupedArticles]
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 page-theme-bg">
          {/* 标题区域 */}
          <div className="flex items-end justify-between mb-8 animate-float-up">
            <div>
              <p className="text-[11px] pixel-text text-pixel-yellow/80 tracking-widest mb-2">
                · LOVE · LETTERS ·
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-pixel-brown pixel-display leading-tight">
                📖 Letters
              </h1>
              <p className="text-sm text-pixel-brown/55 pixel-text mt-2 leading-relaxed">
                This is for each other
                {!loading && articles.length > 0 && (
                  <span className="ml-2 text-pixel-yellow/70">· 共 {articles.length} 封</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="glass-btn px-5 py-2.5 font-bold text-pixel-brown pixel-text text-sm transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFE866 0%, #FFC876 100%)",
                boxShadow: "0 4px 14px rgba(240,208,96,0.3)",
              }}
            >
              ✉️ Write
            </button>
          </div>

          {/* 发布表单弹窗 */}
          {showCreateForm && (
            <CreateArticleForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false);
                loadArticles();
              }}
            />
          )}

          {/* 加载状态 - 骨架屏 */}
          {loading && (
            <div className="space-y-12">
              {[1, 2].map((gi) => (
                <div key={gi}>
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="px-5 py-2 rounded-full flex items-center gap-2.5 opacity-70"
                      style={{
                        background: "rgba(240,208,96,0.3)",
                      }}
                    >
                      <span className="inline-flex w-2.5 h-2.5 rounded-full skeleton-shimmer" />
                      <span className="h-4 w-28 skeleton-shimmer rounded" />
                    </div>
                    <span className="h-px flex-1 bg-pixel-yellow/30" />
                  </div>
                  <div className="space-y-5">
                    {[1, 2].map((i) => (
                      <ArticleCardSkeleton key={i} delay={gi * 80 + i * 50} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && articles.length === 0 && (
            <div
              className="text-center py-24 animate-float-up relative overflow-hidden rounded-[28px]"
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full"
                style={{ background: "rgba(240,208,96,0.2)", filter: "blur(30px)" }}
              />
              <div
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                style={{ background: "rgba(255,183,197,0.2)", filter: "blur(30px)" }}
              />
              <div className="relative">
                <div
                  className="glass-card inline-block p-10 mb-5 rounded-[24px]"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "2px dashed rgba(240,208,96,0.4)",
                  }}
                >
                  <div className="text-7xl mb-2">📖</div>
                </div>
                <p className="text-pixel-brown/75 pixel-text text-lg mb-2">还没有 Letter</p>
                <p className="text-sm text-pixel-brown/50 pixel-text leading-relaxed mb-6">
                  <br />
                  
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="glass-btn px-6 py-2.5 font-bold text-pixel-brown pixel-text transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FFE866 0%, #FFC876 100%)",
                    boxShadow: "0 4px 14px rgba(240,208,96,0.3)",
                  }}
                >
                  写第一封信
                </button>
              </div>
            </div>
          )}

          {/* 时间归档列表 */}
          {!loading && articles.length > 0 && (
            <div className="space-y-14">
              {sortedMonths.map((monthKey, monthIdx) => {
                const [year, month] = monthKey.split("-");
                const count = groupedArticles[monthKey].length;
                return (
                  <div key={monthKey} className="animate-float-up" style={{ animationDelay: `${80 + monthIdx * 120}ms` }}>
                    {/* 年月标题 - 胶囊式渐变徽章 */}
                    <div className="mb-6 flex items-center gap-3">
                      <div
                        className="px-5 py-2 rounded-full flex items-center gap-2.5 relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #FFE866 0%, #FFC876 100%)",
                          boxShadow: "0 4px 12px rgba(240,208,96,0.25)",
                        }}
                      >
                        <span className="text-sm font-bold text-white pixel-text drop-shadow-sm">
                          {year} · {parseInt(month)}月
                        </span>
                        <span
                          className="px-2 py-0.5 text-[10px] rounded-full pixel-text font-bold"
                          style={{ background: "rgba(255,255,255,0.4)", color: "#fff" }}
                        >
                          {count}
                        </span>
                      </div>
                      <span className="h-px flex-1 bg-gradient-to-r from-pixel-yellow/35 via-pixel-pink/30 to-transparent" />
                    </div>

                    {/* 该月的Letters列表 */}
                    <div className="space-y-5">
                      {groupedArticles[monthKey].map((article, aIdx) => (
                        <ArticleCard key={article.id} article={article} delay={aIdx * 70} />
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

// Letters卡片 - 适合长文本预览
const ArticleCard = memo(function ArticleCard({
  article,
  delay = 0,
}: {
  article: Article;
  delay?: number;
}) {
  const display = useMemo(() => getDisplayFromProfile(article.profiles), [article.profiles]);
  const hasEdit = (article.edit_history?.length ?? 0) > 0;
  const preview =
    article.content.length > 120
      ? article.content.slice(0, 120) + "..."
      : article.content;

  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <article
        className="glass-card p-6 sm:p-7 rounded-[28px] relative overflow-hidden transition-all duration-300 hover:scale-[1.005] animate-float-up"
        style={{
          animationDelay: `${delay}ms`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pixel-yellow via-amber-400/70 to-pixel-yellow/50" />

        {/* 角落装饰 */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full transition-opacity group-hover:opacity-80"
          style={{
            background: "rgba(240,208,96,0.18)",
            filter: "blur(24px)",
            opacity: 0.55,
          }}
        />

        {/* 作者和日期 */}
        <header className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base relative"
              style={{
                background: "linear-gradient(135deg, #FFE866 0%, #FFC876 100%)",
                boxShadow: "0 3px 8px rgba(240,208,96,0.35)",
              }}
            >
              {display.avatar}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold text-pixel-brown pixel-text">
                {display.nickname}
              </span>
              <span className="text-[10px] text-pixel-brown/40 pixel-text tracking-wider mt-0.5 flex items-center gap-1.5">
                📅 {formatDate(article.created_at)}
                {hasEdit && (
                  <span className="text-amber-600/70 bg-pixel-yellow/15 px-1.5 py-0.5 rounded">
                    · 已编辑
                  </span>
                )}
              </span>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
            style={{
              background: "rgba(240,208,96,0.15)",
            }}
          >
            <span className="text-amber-600 text-base group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </header>

        {/* 标题 */}
        <h3 className="text-xl sm:text-2xl font-bold text-pixel-brown pixel-text mb-4 leading-snug relative">
          {article.title}
        </h3>

        {/* 正文预览 */}
        <p className="text-pixel-brown/80 pixel-text whitespace-pre-wrap leading-[2] text-[15px] mb-5 relative">
          {preview}
        </p>

        {/* 首张缩略图（如果有的话） */}
        {article.photos && article.photos.length > 0 && (
          <div
            className="overflow-hidden mb-5 relative group/img"
            style={{
              borderRadius: "22px",
              border: "3px solid rgba(255,255,255,0.9)",
              boxShadow: "0 5px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="aspect-[16/9]">
              <SafeImage
                src={article.photos[0].url}
                alt=""
                className="transition-transform duration-500 group-hover/img:scale-105"
              />
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <footer className="flex items-center justify-between pt-4 mt-2 border-t border-dashed border-pixel-brown/12 relative">
          <span
            className="text-xs pixel-text font-bold tracking-wide transition-all duration-300 group-hover:translate-x-1 inline-flex items-center gap-1"
            style={{ color: "#f0a030" }}
          >
            阅读全文
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
          {article.photos && article.photos.length > 1 && (
            <span
              className="text-xs pixel-text flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(240,208,96,0.15)",
                color: "#c79a30",
              }}
            >
              <span>📷</span>
              <span>{article.photos.length} 张照片</span>
            </span>
          )}
        </footer>
      </article>
    </Link>
  );
});

// Letters卡片骨架屏
function ArticleCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass-card p-6 sm:p-7 rounded-[28px] animate-float-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 作者和日期 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-20 skeleton-shimmer rounded" />
            <div className="h-2.5 w-28 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-full skeleton-shimmer" />
      </div>

      {/* 标题骨架 */}
      <div className="h-7 w-3/4 skeleton-shimmer rounded mb-4" />

      {/* 正文骨架 */}
      <div className="space-y-2.5 mb-5">
        <div className="h-3.5 w-full skeleton-shimmer rounded" />
        <div className="h-3.5 w-full skeleton-shimmer rounded" />
        <div className="h-3.5 w-2/3 skeleton-shimmer rounded" />
      </div>

      {/* 图片骨架 */}
      <div
        className="aspect-[16/9] skeleton-shimmer"
        style={{ borderRadius: "22px" }}
      />
    </div>
  );
}
