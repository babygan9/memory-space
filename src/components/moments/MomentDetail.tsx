"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import {
  getMomentById,
  getComments,
  createComment,
  formatDate,
  formatDateTime,
} from "@/lib/api";
import { getDisplayFromProfile } from "@/lib/userDisplay";
import SafeImage from "@/components/ui/SafeImage";
import type { Moment, Comment } from "@/types/database";

export default function MomentDetailClient({ id }: { id: string }) {
  const [moment, setMoment] = useState<Moment | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showFullTime, setShowFullTime] = useState<Record<string, boolean>>({});
  const [timeIndex, setTimeIndex] = useState(0);
  const router = useRouter();

  const display = useMemo(
    () => (moment ? getDisplayFromProfile(moment.profiles) : { nickname: "", avatar: "" }),
    [moment]
  );

  const allTimes = moment
    ? [moment.created_at, ...(moment.edit_history || []).map((e) => e.edited_at)]
    : [];

  const handleTimeClick = useCallback(() => {
    if (allTimes.length <= 1) return;
    setTimeIndex((prev) => (prev + 1) % allTimes.length);
  }, [allTimes.length]);

  const loadMoment = useCallback(async () => {
    const data = await getMomentById(id);
    setMoment(data);
  }, [id]);

  const loadComments = useCallback(async (showLoading = false) => {
    if (showLoading) setCommentsLoading(true);
    const data = await getComments("moment", id);
    setComments(data);
    setCommentsLoading(false);
  }, [id]);

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await Promise.all([loadMoment(), loadComments()]);
      setInitialLoading(false);
    };
    init();
  }, [loadMoment, loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    const result = await createComment("moment", id, newComment.trim());

    if (result) {
      setNewComment("");
      loadComments(true);
    } else {
      alert("评论失败");
    }

    setSubmittingComment(false);
  };

  const toggleTime = (commentId: string) => {
    setShowFullTime((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (initialLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-10 sm:px-6 page-theme-bg">
            <div className="mb-8 h-5 w-20 skeleton-shimmer rounded" />
            <div className="glass-card p-6 sm:p-7 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full skeleton-shimmer" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-20 skeleton-shimmer rounded" />
                  <div className="h-2.5 w-24 skeleton-shimmer rounded" />
                </div>
              </div>
              <div className="space-y-2.5 mb-6">
                <div className="h-3.5 w-full skeleton-shimmer rounded" />
                <div className="h-3.5 w-5/6 skeleton-shimmer rounded" />
                <div className="h-3.5 w-4/6 skeleton-shimmer rounded" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="aspect-square rounded-[22px] skeleton-shimmer" />
                <div className="aspect-square rounded-[22px] skeleton-shimmer" />
                <div className="aspect-square rounded-[22px] skeleton-shimmer" />
              </div>
            </div>
            <div className="glass-card p-6 sm:p-7">
              <div className="h-6 w-28 skeleton-shimmer rounded mb-5" />
              <div className="h-24 w-full skeleton-shimmer rounded-[22px] mb-5" />
              <div className="space-y-5">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-16 skeleton-shimmer rounded" />
                      <div className="h-3.5 w-full skeleton-shimmer rounded" />
                      <div className="h-3.5 w-3/4 skeleton-shimmer rounded" />
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

  if (!moment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Navbar />
          <div className="text-center py-24 page-theme-bg">
            <div className="glass-card inline-block p-8 mb-5">
              <div className="text-5xl mb-2">🌱</div>
            </div>
            <p className="text-pixel-brown/60 pixel-text mb-5">找不到这条记录啦</p>
            <Link
              href="/moments"
              className="glass-btn inline-block px-6 py-2.5 font-bold text-pixel-brown pixel-text !bg-gradient-to-br !from-pixel-yellow/55 !to-pixel-pink/30"
            >
              ← 返回 Post
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 py-10 sm:px-6 page-theme-bg">
          {/* 返回按钮 */}
          <button
            onClick={() => router.back()}
            className="mb-8 glass-btn !shadow-none !bg-transparent !backdrop-blur-none !border-transparent px-3 py-1.5 text-pixel-brown/60 hover:text-pixel-pink pixel-text text-sm group animate-float-up flex items-center gap-1.5"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>返回</span>
          </button>

          {/* Post卡片 */}
          <article className="glass-card p-6 sm:p-7 mb-10 animate-float-up animate-float-up-delay-1">
            <header className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pixel-pink/45 to-pixel-yellow/35 flex items-center justify-center text-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_rgba(232,96,136,0.2)] ring-1 ring-white/70">
                  {display.avatar}
                </div>
                <div className="flex flex-col leading-tight">
                  <p className="font-bold text-pixel-brown pixel-text text-[15px]">
                    {display.nickname}
                  </p>
                </div>
              </div>
            </header>

            <p className="text-pixel-brown/92 pixel-text whitespace-pre-wrap mb-6 leading-[1.95] text-[15.5px]">
              {moment.content}
            </p>

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
                {moment.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-[22px] overflow-hidden bg-pixel-brown/5 ring-1 ring-white/70 shadow-[0_6px_18px_-4px_rgba(139,115,85,0.2)]"
                  >
                    <SafeImage src={photo.url} alt="" />
                  </div>
                ))}
              </div>
            )}

            {/* 发布时间 */}
            <p
              className={`mt-7 text-[11px] text-pixel-brown/45 pixel-text text-right flex items-center justify-end gap-2 ${
                allTimes.length > 1 ? "cursor-pointer hover:text-pixel-pink/80 select-none" : ""
              }`}
              onClick={handleTimeClick}
            >
              <span>🕒</span>
              <span>
                {timeIndex === 0
                  ? formatDateTime(allTimes[timeIndex] || moment.created_at)
                  : `第${timeIndex}次编辑 · ${formatDateTime(allTimes[timeIndex])}`}
              </span>
              {allTimes.length > 1 && (
                <span className="opacity-60">（点击切换）</span>
              )}
            </p>
          </article>

          {/* Comments  区域 */}
          <section className="glass-card p-6 sm:p-7 animate-float-up animate-float-up-delay-2">
            <h3 className="font-bold text-pixel-brown pixel-text mb-5 flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <span>Comments</span>
              <span className="glass-btn !py-1 !px-2.5 text-[11px] text-pixel-brown/60 !shadow-none !bg-pixel-yellow/30">
                {comments.length}
              </span>
            </h3>

            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write Your Comment ..."
                className="w-full h-24 glass-input pixel-text resize-none mb-3.5 text-sm"
                disabled={submittingComment}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="glass-btn px-6 py-2.5 font-bold text-pixel-brown pixel-text text-sm !bg-gradient-to-br !from-pixel-yellow/55 !to-pixel-pink/30 hover:!from-pixel-yellow/65"
                >
                  {submittingComment ? "发送中…" : "·  发送  ·"}
                </button>
              </div>
            </form>

            {commentsLoading && (
              <div className="space-y-5">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-16 skeleton-shimmer rounded" />
                      <div className="h-3.5 w-full skeleton-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!commentsLoading && (
              <>
                {comments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="inline-flex glass-card !p-0 px-5 py-3 text-pixel-brown/45 pixel-text text-sm items-center gap-2">
                      <span>🪷</span>
                      <span>还没有评论，来说点什么吧～</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {comments.map((c) => (
                      <CommentRow
                        key={c.id}
                        comment={c}
                        showFull={!!showFullTime[c.id]}
                        onToggle={() => toggleTime(c.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function CommentRow({
  comment,
  showFull,
  onToggle,
}: {
  comment: Comment;
  showFull: boolean;
  onToggle: () => void;
}) {
  const d = useMemo(() => getDisplayFromProfile(comment.profiles), [comment.profiles]);
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pixel-yellow/45 to-pixel-pink/30 flex-shrink-0 flex items-center justify-center text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_6px_rgba(240,208,96,0.22)] ring-1 ring-white/70">
        {d.avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[15px] font-bold text-pixel-brown pixel-text">
            {d.nickname}
          </span>
          <button
            onClick={onToggle}
            className="text-[10px] text-pixel-brown/40 pixel-text hover:text-pixel-pink/70 transition-colors"
          >
            {showFull ? formatDateTime(comment.created_at) : formatDate(comment.created_at)}
          </button>
        </div>
        <div className="glass !p-0 !shadow-none !bg-white/55 rounded-[22px] px-4 py-3 ring-1 ring-white/70">
          <p className="text-pixel-brown/82 pixel-text text-[14.5px] leading-[1.85] whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}
