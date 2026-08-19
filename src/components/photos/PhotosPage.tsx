"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import {
  getAllPhotos,
  formatDate,
  type PhotoWithOwner,
} from "@/lib/api";
import { getDisplayFromProfile } from "@/lib/userDisplay";
import SafeImage from "@/components/ui/SafeImage";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoWithOwner | null>(
    null
  );
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await getAllPhotos();
      setPhotos(data);
      setLoading(false);
    };
    load();
  }, []);

  const closePreview = useCallback(() => {
    setPreviewPhoto(null);
  }, []);

  // ESC 关闭预览
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") navigatePrev();
      if (e.key === "ArrowRight") navigateNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closePreview, previewIndex]);

  const openPreview = (photo: PhotoWithOwner, idx: number) => {
    setPreviewPhoto(photo);
    setPreviewIndex(idx);
  };

  const navigatePrev = () => {
    if (photos.length === 0) return;
    const newIdx = (previewIndex - 1 + photos.length) % photos.length;
    setPreviewIndex(newIdx);
    setPreviewPhoto(photos[newIdx]);
  };

  const navigateNext = () => {
    if (photos.length === 0) return;
    const newIdx = (previewIndex + 1) % photos.length;
    setPreviewIndex(newIdx);
    setPreviewPhoto(photos[newIdx]);
  };

  // 生成骨架屏占位
  const skeletonCount = Math.min(12, Math.max(6, photos.length || 6));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream-100">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-8 animate-float-up">
            <div>
              <h1 className="text-3xl font-bold text-pixel-brown pixel-text flex items-center gap-2">
                🖼️ Pinterest
              </h1>
              <p className="text-sm text-pixel-brown/60 pixel-text mt-1.5">
                Our Picture Wall
                {!loading && photos.length > 0 && (
                  <span className="ml-2">· 共 {photos.length} 张</span>
                )}
              </p>
            </div>
            <div className="flex gap-1">
              <Bunny size={50} />
              <Hamster size={55} />
            </div>
          </div>

          {/* 加载状态 - 瀑布流骨架 */}
          {loading && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid rounded-[22px] skeleton-shimmer animate-float-up"
                  style={{
                    height: `${150 + ((i * 37) % 150)}px`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && photos.length === 0 && (
            <div className="glass-card rounded-[28px] py-20 text-center animate-float-up">
              <div className="text-6xl mb-4 inline-block animate-bounce" style={{ animationDuration: "3s" }}>📷</div>
              <p className="text-pixel-brown/70 pixel-text mb-2 text-lg">
                还没有照片
              </p>
              <p className="text-sm text-pixel-brown/50 pixel-text">
                在Post或Letters中上传照片吧
              </p>
            </div>
          )}

          {/* 瀑布流Pinterest */}
          {!loading && photos.length > 0 && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid mb-3 rounded-[22px] overflow-hidden cursor-pointer group animate-float-up"
                  style={{ animationDelay: `${idx * 25}ms` }}
                  onClick={() => openPreview(photo, idx)}
                >
                  <div
                    className="relative transition-all duration-300 group-hover:scale-[1.02]"
                    style={{
                      borderRadius: "22px",
                      overflow: "hidden",
                      border: "3px solid rgba(255,255,255,0.8)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                    }}
                  >
                    <SafeImage
                      src={photo.url}
                      alt=""
                      className="w-full"
                    />
                    {/* 悬停显示日期和来源 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">
                          {photo.owner_type === "moment" ? "📝" : "📖"}
                        </span>
                        <span className="text-white pixel-text text-xs font-bold">
                          {photo.owner_type === "moment" ? "Post" : "Letters"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white pixel-text text-xs opacity-90">
                          📅 {formatDate(photo.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Photo预览弹窗 */}
        {previewPhoto && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={closePreview}
          >
            {/* 左右导航按钮 */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(12px)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(12px)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                  }}
                >
                  ›
                </button>
              </>
            )}

            <div
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 顶部栏 */}
              <div className="absolute -top-14 left-0 right-0 flex items-center justify-between">
                <div className="text-white/80 pixel-text text-sm">
                  {previewIndex + 1} / {photos.length}
                </div>
                {/* 关闭按钮 */}
                <button
                  onClick={closePreview}
                  className="text-white/90 hover:text-white pixel-text text-sm flex items-center gap-1.5 px-4 py-2 rounded-full transition-all hover:bg-white/10"
                >
                  ✕ 关闭
                </button>
              </div>

              {/* 图片 */}
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: "100%",
                  maxHeight: "78vh",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  border: "4px solid rgba(255,255,255,0.2)",
                }}
              >
                <img
                  src={previewPhoto.url}
                  alt=""
                  className="max-w-full mx-auto object-contain"
                  style={{ maxHeight: "78vh" }}
                />
              </div>

              {/* 底部信息 */}
              <div
                className="mt-5 mx-auto max-w-xl px-5 py-3.5 rounded-[22px] flex items-center justify-between"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{
                      background: previewPhoto.owner_type === "moment"
                        ? "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)"
                        : "linear-gradient(135deg, #FFD1DC 0%, #FFB8C9 100%)",
                    }}
                  >
                    {previewPhoto.owner_type === "moment" ? "📝" : "📖"}
                  </div>
                  <div>
                    <p className="text-white pixel-text text-sm font-bold">
                      {previewPhoto.owner_type === "moment" ? "Post" : "Letters"}
                    </p>
                    <p className="text-white/60 pixel-text text-xs">
                      📅 {formatDate(previewPhoto.created_at)}
                    </p>
                  </div>
                </div>
                <span
                  className="pixel-text text-xs px-3 py-1 rounded-full"
                  style={{
                    background: previewPhoto.owner_type === "moment"
                      ? "rgba(255,217,61,0.3)"
                      : "rgba(255,183,197,0.3)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {previewIndex !== null && (
                    <span className="mr-1">
                      {previewIndex + 1} / {photos.length}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
