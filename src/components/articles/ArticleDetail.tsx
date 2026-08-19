"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import {
  getArticleById,
  getComments,
  createComment,
  formatDate,
  formatDateTime,
} from "@/lib/api";
import { getDisplayFromProfile } from "@/lib/userDisplay";
import SafeImage from "@/components/ui/SafeImage";
import type { Article, Comment } from "@/types/database";

interface ArticleDetailProps {
  id: string;
}

export default function ArticleDetailClient({ id }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showFullTime, setShowFullTime] = useState<Record<string, boolean>>({});
  const [timeIndex, setTimeIndex] = useState(0);
  const router = useRouter();

  // 构建时间数组：[发布时间, 编辑1, 编辑2, ...]
  const allTimes = article
    ? [article.created_at, ...(article.edit_history || []).map((e) => e.edited_at)]
    : [];

  const handleTimeClick = () => {
    if (allTimes.length <= 1) return;
    setTimeIndex((prev) => (prev + 1) % allTimes.length);
  };

  const loadArticle = async () => {
    const data = await getArticleById(id);
    setArticle(data);
  };

  const loadComments = async (showLoading = false) => {
    if (showLoading) setCommentsLoading(true);
    const data = await getComments("article", id);
    setComments(data);
    setCommentsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await Promise.all([loadArticle(), loadComments()]);
      setInitialLoading(false);
    };
    init();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const result = await createComment("article", id, newComment.trim());

    if (result) {
      setNewComment("");
      loadComments(true);
    } else {
      alert("Comments  失败，请稍后重试");
    }

    setSubmittingComment(false);
  };

  const toggleTime = (commentId: string) => {
    setShowFullTime((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (initialLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream-100">
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6 h-5 w-16 skeleton-shimmer rounded" />

            {/* Letters卡片骨架 */}
            <div className="glass-card p-8 mb-8 rounded-[28px] animate-float-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                <div className="h-4 w-20 skeleton-shimmer rounded" />
              </div>
              <div className="h-8 w-3/4 skeleton-shimmer rounded mb-4" />
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-4 skeleton-shimmer rounded"
                    style={{ width: `${100 - (i % 3) * 15}%` }}
                  />
                ))}
              </div>
              <div className="aspect-[16/9] rounded-2xl skeleton-shimmer" />
            </div>

            {/* Comments  区骨架 */}
            <div className="glass-card p-6 rounded-[28px] animate-float-up" style={{ animationDelay: "120ms" }}>
              <div className="h-5 w-24 skeleton-shimmer rounded mb-4" />
              <div className="h-20 w-full skeleton-shimmer rounded-2xl mb-4" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 skeleton-shimmer rounded" />
                      <div className="h-3 w-full skeleton-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!article) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-cream-100">
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-8">
            <div className="glass-card rounded-[28px] p-12 text-center animate-float-up">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-pixel-brown/50 pixel-text mb-3">找不到这篇Letters</p>
              <Link
                href="/articles"
                className="inline-block glass-btn px-5 py-2.5 pixel-text text-sm font-bold bg-pixel-yellow/40 hover:bg-pixel-yellow/50 text-pixel-brown"
              >
                返回Letters列表
              </Link>
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

        {/* Letters内容更宽更舒适 */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* 返回按钮 */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-pixel-brown/50 hover:text-pixel-brown pixel-text text-sm transition-all animate-float-up glass-btn px-4 py-2 hover:bg-pixel-brown/5"
          >
            ← 返回
          </button>

          {/* Letters卡片 - 更大内边距更适合阅读 */}
          <article className="glass-card p-8 mb-8 rounded-[28px] animate-float-up overflow-hidden relative" style={{ animationDelay: "80ms" }}>
            {/* 顶部装饰条 */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pixel-yellow via-pixel-pink to-pixel-yellow/70" />

            {/* 作者和日期 */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-pixel-brown/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                    boxShadow: "0 3px 8px rgba(255,217,61,0.35)",
                  }}
                >
                  {getDisplayFromProfile(article.profiles).avatar}
                </div>
                <div>
                  <p className="font-bold text-pixel-brown pixel-text">
                    {getDisplayFromProfile(article.profiles).nickname}
                  </p>
                  <p className="text-xs text-pixel-brown/40 pixel-text">📖 书信</p>
                </div>
              </div>
            </div>

            {/* 标题 - 更大更醒目 */}
            <h1 className="text-2xl font-bold text-pixel-brown pixel-text mb-6 leading-snug">
              {article.title}
            </h1>

            {/* 正文 - 更大行高、更大字号适合长文本阅读 */}
            <div className="text-pixel-brown/90 pixel-text whitespace-pre-wrap leading-[1.95] text-base mb-8">
              {article.content}
            </div>

            {/* 照片网格 - Letters里的Photo可以更大 */}
            {article.photos && article.photos.length > 0 && (
              <div
                className={`grid gap-3 ${
                  article.photos.length === 1
                    ? "grid-cols-1"
                    : article.photos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                }`}
              >
                {article.photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-2xl overflow-hidden bg-pixel-brown/5 animate-float-up"
                    style={{
                      animationDelay: `${160 + i * 60}ms`,
                      border: "3px solid rgba(255,217,61,0.25)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    <SafeImage src={photo.url} alt="" />
                  </div>
                ))}
              </div>
            )}

            {/* 发布时间 */}
            <p
              className={`mt-8 text-xs pixel-text pt-6 border-t border-pixel-brown/10 flex items-center justify-end gap-1.5 ${
                allTimes.length > 1 ? "cursor-pointer hover:text-pixel-brown/60 select-none text-pixel-brown/40" : "text-pixel-brown/40"
              }`}
              onClick={handleTimeClick}
            >
              <span>🕒</span>
              <span>
                {timeIndex === 0
                  ? formatDateTime(allTimes[timeIndex] || article.created_at)
                  : `第${timeIndex}次编辑：${formatDateTime(allTimes[timeIndex])}`}
              </span>
              {allTimes.length > 1 && (
                <span className="text-[10px] ml-1 opacity-60">（点击切换）</span>
              )}
            </p>
          </article>

          {/* Comments  区域 */}
          <div className="glass-card p-6 rounded-[28px] animate-float-up" style={{ animationDelay: "200ms" }}>
            <h3 className="font-bold text-pixel-brown pixel-text mb-4 flex items-center gap-2">
              💬 Comments  
              <span className="text-xs text-pixel-brown/50 bg-pixel-brown/5 px-2.5 py-0.5 rounded-full">
                {comments.length}
              </span>
            </h3>

            {/* Comments  输入框 */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write Your Comment  ..."
                className="w-full h-24 glass-input pixel-text resize-none mb-3 rounded-2xl"
                disabled={submittingComment}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="glass-btn px-5 py-2.5 font-bold text-pixel-brown pixel-text rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                    boxShadow: newComment.trim() ? "0 3px 10px rgba(255,217,61,0.4)" : "none",
                  }}
                >
                  {submittingComment ? "发送中..." : "✉️ 发送"}
                </button>
              </div>
            </form>

            {/* Comments  加载骨架屏 */}
            {commentsLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 skeleton-shimmer rounded" />
                      <div className="h-3 w-full skeleton-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments  列表 */}
            {!commentsLoading && (
              <>
                {comments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-2 opacity-40">🌱</div>
                    <p className="text-pixel-brown/40 pixel-text py-2 text-sm">
                      还没有Comment  ，来说点什么吧～
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment, i) => (
                      <CommentRow
                        key={comment.id}
                        comment={comment}
                        showFullTime={!!showFullTime[comment.id]}
                        onToggleTime={() => toggleTime(comment.id)}
                        delay={i * 50}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ========== memo 化的评论行组件 ==========
const CommentRow = memo(function CommentRow({
  comment,
  showFullTime,
  onToggleTime,
  delay = 0,
}: {
  comment: Comment;
  showFullTime: boolean;
  onToggleTime: () => void;
  delay?: number;
}) {
  const display = getDisplayFromProfile(comment.profiles);
  return (
    <div
      className="flex gap-3 animate-float-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
        style={{
          background: "linear-gradient(135deg, #FFD1DC 0%, #FFB8C9 100%)",
          boxShadow: "0 2px 6px rgba(255,182,193,0.3)",
        }}
      >
        {display.avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-pixel-brown pixel-text">
            {display.nickname}
          </span>
          <button
            onClick={onToggleTime}
            className="text-xs text-pixel-brown/40 pixel-text hover:text-pixel-brown/60 transition-colors"
          >
            {showFullTime
              ? formatDateTime(comment.created_at)
              : formatDate(comment.created_at)}
          </button>
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-pixel-brown/80 pixel-text text-sm leading-relaxed break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
});
