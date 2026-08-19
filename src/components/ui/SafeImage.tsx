"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function SafeImage({ src, alt = "", className = "" }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-pixel-brown/5 ${className}`}
      >
        <span className="text-3xl mb-2">🖼️</span>
        <span className="text-xs text-pixel-brown/50 pixel-text">加载失败</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 骨架屏 - shimmer 微光扫过 */}
      {isLoading && (
        <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            {/* 旋转的加载小图标 */}
            <svg
              className="w-8 h-8 text-pixel-brown/30 spin-slow"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-[10px] text-pixel-brown/40 pixel-text tracking-wider">
              LOADING...
            </span>
          </div>
        </div>
      )}

      {/* 实际图片 */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
          isLoading ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
        }`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
