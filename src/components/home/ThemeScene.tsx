"use client";

import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import {
  PixelStar,
  PixelBalloon,
  PixelGift,
  PixelCake,
  PixelChristmasTree,
  PixelPumpkin,
  PixelConfetti,
  PixelHeart,
  PixelRose,
  PixelChocolate,
  PixelEnvelope,
  PixelCupidArrow,
  PixelDiamond,
} from "@/components/decorations/PixelDecorations";
import { ThemeType, themes } from "@/lib/themes";

interface ThemeSceneProps {
  theme: ThemeType;
}

export default function ThemeScene({ theme }: ThemeSceneProps) {
  const config = themes[theme];

  return (
    <div className="relative w-full">
      {/* 主题背景渐变 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-3xl -z-10`}
      />

      {/* 装饰元素容器 */}
      <div className="relative w-full max-w-3xl mx-auto">
        {/* ===== 各主题装饰 ===== */}
        <ThemeDecorations theme={theme} />

        {/* ===== 角色展示区 ===== */}
        <div className="relative flex flex-col items-center py-12">
          <div className="flex items-end justify-center gap-2 md:gap-6 my-4">
            {/* 兔兔圆 */}
            <div className="transform hover:scale-105 transition-transform duration-300 z-10">
              <Bunny size={180} />
            </div>

            {/* 主题中央装饰 */}
            <div className="hidden md:flex z-10">
              <CenterDecoration theme={theme} />
            </div>

            {/* 萌仓 */}
            <div className="transform hover:scale-105 transition-transform duration-300 z-10">
              <Hamster size={200} />
            </div>
          </div>

          {/* 移动端中央装饰 */}
          <div className="flex md:hidden mb-2 z-10">
            <CenterDecoration theme={theme} />
          </div>

          {/* 角色名字 */}
          <div className="flex justify-center gap-16 md:gap-28 text-sm text-pixel-brown font-bold pixel-text mt-2">
            <span>🐰 兔兔圆</span>
            <span>🐹 萌仓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 主题装饰元素 =====
function ThemeDecorations({ theme }: { theme: ThemeType }) {
  switch (theme) {
    case "birthday":
      return (
        <>
          {/* 气球 */}
          <div className="absolute top-6 left-8 animate-bounce" style={{ animationDelay: "0s" }}>
            <PixelBalloon color="pink" size={40} />
          </div>
          <div className="absolute top-10 left-1/4 animate-bounce" style={{ animationDelay: "0.3s" }}>
            <PixelBalloon color="yellow" size={36} />
          </div>
          <div className="absolute top-4 right-1/4 animate-bounce" style={{ animationDelay: "0.6s" }}>
            <PixelBalloon color="blue" size={44} />
          </div>
          <div className="absolute top-8 right-6 animate-bounce" style={{ animationDelay: "0.9s" }}>
            <PixelBalloon color="green" size={38} />
          </div>

          {/* 星星 */}
          <div className="absolute top-20 left-16">
            <PixelStar size={20} />
          </div>
          <div className="absolute top-32 right-20">
            <PixelStar size={16} />
          </div>

          {/* 彩带 */}
          <div className="absolute top-4 left-1/3">
            <PixelConfetti size={6} />
          </div>
          <div className="absolute top-6 right-1/3">
            <PixelConfetti size={6} />
          </div>
        </>
      );

    case "christmas":
      return (
        <>
          {/* 星星 */}
          <div className="absolute top-6 left-10">
            <PixelStar size={24} />
          </div>
          <div className="absolute top-12 right-12">
            <PixelStar size={20} />
          </div>
          <div className="absolute top-24 left-1/4">
            <PixelStar size={16} />
          </div>
          <div className="absolute top-16 right-1/4">
            <PixelStar size={18} />
          </div>

          {/* 礼物 */}
          <div className="absolute bottom-20 left-6">
            <PixelGift color="red" size={44} />
          </div>
          <div className="absolute bottom-24 right-8">
            <PixelGift color="green" size={40} />
          </div>
          <div className="absolute bottom-16 left-1/4">
            <PixelGift color="blue" size={36} />
          </div>
        </>
      );

    case "halloween":
      return (
        <>
          {/* 南瓜 */}
          <div className="absolute top-8 left-8">
            <PixelPumpkin size={48} />
          </div>
          <div className="absolute top-12 right-10">
            <PixelPumpkin size={40} />
          </div>
          <div className="absolute bottom-20 left-12">
            <PixelPumpkin size={36} />
          </div>

          {/* 星星 */}
          <div className="absolute top-6 left-1/3">
            <PixelStar size={18} />
          </div>
          <div className="absolute top-10 right-1/4">
            <PixelStar size={22} />
          </div>
        </>
      );

    case "normal":
    default:
      return (
        <>
          {/* 左上角爱心组 */}
          <div className="absolute top-6 left-8 animate-pulse" style={{ animationDelay: "0s" }}>
            <PixelHeart size={36} color="rose" />
          </div>
          <div className="absolute top-4 left-24 animate-pulse" style={{ animationDelay: "0.4s" }}>
            <PixelHeart size={20} color="pink" />
          </div>

          {/* 右上角爱心组 */}
          <div className="absolute top-8 right-6 animate-pulse" style={{ animationDelay: "0.2s" }}>
            <PixelHeart size={32} color="red" />
          </div>
          <div className="absolute top-4 right-24 animate-pulse" style={{ animationDelay: "0.6s" }}>
            <PixelHeart size={18} color="rose" />
          </div>

          {/* 左侧中部 - 玫瑰和信封 */}
          <div className="absolute top-1/3 left-4 transform -translate-y-1/2">
            <PixelRose size={44} />
          </div>
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
            <PixelEnvelope size={36} />
          </div>

          {/* 右侧中部 - 巧克力和钻石 */}
          <div className="absolute top-1/3 right-4 transform -translate-y-1/2">
            <PixelChocolate size={44} />
          </div>
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
            <PixelDiamond size={32} />
          </div>

          {/* 上部丘比特之箭（斜着穿过） */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 rotate-[-20deg]">
            <PixelCupidArrow size={44} />
          </div>

          {/* 散落的小爱心 */}
          <div className="absolute top-28 left-1/4 animate-bounce" style={{ animationDelay: "0.1s", animationDuration: "2s" }}>
            <PixelHeart size={14} color="pink" />
          </div>
          <div className="absolute top-32 right-1/4 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}>
            <PixelHeart size={12} color="rose" />
          </div>
          <div className="absolute top-40 left-1/3 animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.2s" }}>
            <PixelHeart size={10} color="pink" />
          </div>
          <div className="absolute top-36 right-1/3 animate-bounce" style={{ animationDelay: "0.7s", animationDuration: "1.8s" }}>
            <PixelHeart size={12} color="red" />
          </div>

          {/* 底部玫瑰装饰 */}
          <div className="absolute bottom-16 left-10">
            <PixelRose size={32} />
          </div>
          <div className="absolute bottom-20 right-10">
            <PixelRose size={32} />
          </div>

          {/* 星星点缀 */}
          <div className="absolute top-20 left-1/5">
            <PixelStar size={14} />
          </div>
          <div className="absolute top-24 right-1/5">
            <PixelStar size={12} />
          </div>
          <div className="absolute bottom-28 left-1/3">
            <PixelStar size={10} />
          </div>
          <div className="absolute bottom-24 right-1/3">
            <PixelStar size={12} />
          </div>
        </>
      );
  }
}

// ===== 中央装饰 =====
function CenterDecoration({ theme }: { theme: ThemeType }) {
  switch (theme) {
    case "birthday":
      return <PixelCake size={80} />;
    case "christmas":
      return <PixelChristmasTree size={90} />;
    case "halloween":
      return <PixelPumpkin size={70} />;
    case "normal":
    default:
      return (
        <div className="flex items-end gap-1">
          <PixelHeart size={60} color="rose" />
          <PixelDiamond size={36} />
          <PixelHeart size={60} color="pink" />
        </div>
      );
  }
}
