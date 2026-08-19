"use client";

import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import { getFootprints } from "@/lib/api";
import type { Footprint } from "@/types/database";
import {
  PROVINCE_PATHS,
  PROVINCE_TEXTS,
  PROVINCE_CENTER,
  PROVINCE_NAME_MAP,
} from "./chinaMapData";

export default function FootprintsPage() {
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [showOverview, setShowOverview] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getFootprints();
    setFootprints(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 规范化省份名
  const normalizeProvince = useCallback((name: string): string => {
    return PROVINCE_NAME_MAP[name] || name;
  }, []);

  // 按省份分组 Foot Prints
  const footprintsByProvince = useMemo(() => {
    const map: Record<string, Footprint[]> = {};
    footprints.forEach((f) => {
      const key = normalizeProvince(f.province);
      if (!map[key]) map[key] = [];
      map[key].push(f);
    });
    return map;
  }, [footprints, normalizeProvince]);

  const visitedProvinces = useMemo(() => new Set(Object.keys(footprintsByProvince)), [footprintsByProvince]);
  const totalCities = footprints.length;
  const totalProvinces = visitedProvinces.size;
  // 完成度百分数
  const completionPercent = Math.round((totalProvinces / 33) * 100);

  // 处理省份点击
  const handleProvinceClick = useCallback((provinceId: string) => {
    if (!svgRef.current) return;
    const center = PROVINCE_CENTER[provinceId];
    if (!center) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / 1134;
    const scaleY = rect.height / 976;
    setPopupPos({
      x: rect.left + center.x * scaleX,
      y: rect.top + center.y * scaleY,
    });
    setSelectedProvince((prev) => (prev === provinceId ? null : provinceId));
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ background: "#F7C5C5" }}>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6 animate-float-up">
              <div>
                <h1
                  className="text-3xl font-bold pixel-text flex items-center gap-2"
                  style={{ color: "#222" }}
                >
                  <span>🗺️</span>  Foot Prints
                </h1>
                <p
                  className="pixel-text text-sm mt-1.5"
                  style={{ color: "rgba(0,0,0,0.5)" }}
                >
                  
                </p>
              </div>
              <div className="flex gap-1">
                <Bunny size={50} />
                <Hamster size={55} />
              </div>
            </div>

            {/* 统计卡骨架 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-[22px] skeleton-shimmer animate-float-up" style={{ animationDelay: `${i * 40}ms` }} />
              ))}
            </div>

            <div
              className="rounded-[28px] h-[520px] skeleton-shimmer animate-float-up"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FFE5EC 0%, #F7C5C5 100%)" }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* 标题和统计 */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 animate-float-up">
            <div>
              <h1
                className="text-3xl font-bold pixel-text flex items-center gap-2"
                style={{ color: "#222" }}
              >
                <span>🗺️</span>  Foot Prints
              </h1>
              <p
                className="pixel-text text-sm mt-1.5"
                style={{ color: "rgba(0,0,0,0.5)" }}
              >
                
                {totalProvinces > 0 && (
                  <span className="ml-2">· 共 {totalProvinces} / 33 个省份</span>
                )}
              </p>
            </div>
            <div className="flex gap-1">
              <Bunny size={50} />
              <Hamster size={55} />
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div
              className="glass-card p-4 rounded-[22px] animate-float-up relative overflow-hidden"
              style={{
                animationDelay: "20ms",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-400" />
              <p className="text-xs pixel-text mb-1" style={{ color: "#666" }}>
                📍 踏足省份
              </p>
              <p className="text-2xl font-bold pixel-text flex items-baseline gap-1" style={{ color: "#222" }}>
                {totalProvinces}
                <span className="text-sm opacity-50 font-normal">/ 33</span>
              </p>
            </div>
            <div
              className="glass-card p-4 rounded-[22px] animate-float-up relative overflow-hidden"
              style={{
                animationDelay: "40ms",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-400" />
              <p className="text-xs pixel-text mb-1" style={{ color: "#666" }}>
                🏙️ 到访城市
              </p>
              <p className="text-2xl font-bold pixel-text" style={{ color: "#222" }}>
                {totalCities}
              </p>
            </div>
            <div
              className="glass-card p-4 rounded-[22px] animate-float-up relative overflow-hidden"
              style={{
                animationDelay: "60ms",
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <p className="text-xs pixel-text mb-1" style={{ color: "#666" }}>
                🎯 完成度
              </p>
              <p className="text-2xl font-bold pixel-text flex items-baseline gap-1" style={{ color: "#222" }}>
                {completionPercent}
                <span className="text-sm opacity-50 font-normal">%</span>
              </p>
              {/* 进度条 */}
              <div
                className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(0,0,0,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completionPercent}%`,
                    background: "linear-gradient(90deg, #34D399, #14B8A6)",
                  }}
                />
              </div>
            </div>
            <div
              className="animate-float-up"
              style={{ animationDelay: "80ms" }}
            >
              <button
                onClick={() => setShowOverview(true)}
                className="w-full h-full p-4 rounded-[22px] pixel-text font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-center"
                style={{
                  background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                  color: "#222",
                  border: "2px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 4px 14px rgba(255,217,61,0.45)",
                }}
              >
                <p className="text-xs opacity-70 mb-1">📋 全部列表</p>
                <p className="text-xl font-bold pixel-text">总览 →</p>
              </button>
            </div>
          </div>

          {/* 地图容器 */}
          <div
            className="relative overflow-hidden rounded-[28px] p-4 md:p-8 animate-float-up"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(16px)",
              border: "2px solid rgba(255,255,255,0.5)",
              boxShadow: "0 8px 32px rgba(247,117,139,0.15)",
            }}
          >
            <div
              className="relative w-full"
              style={{ aspectRatio: "1134/976" }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 1134 976"
                className="w-full h-full"
                onClick={() => setSelectedProvince(null)}
              >
                {/* ===== 省份路径（顺序与原版完全一致） ===== */}
                {PROVINCE_PATHS.map((p) => (
                  <ProvincePath
                    key={`path-${p.id}`}
                    provinceId={p.id}
                    pathD={p.d}
                    isVisited={visitedProvinces.has(p.id)}
                    isHovered={hoveredProvince === p.id}
                    isSelected={selectedProvince === p.id}
                    onHover={setHoveredProvince}
                    onClick={handleProvinceClick}
                  />
                ))}

                {/* ===== 省份名称文字 ===== */}
                {PROVINCE_TEXTS.map((t, i) => (
                  <ProvinceText
                    key={`text-${i}`}
                    provinceId={t.id}
                    text={t.text}
                    x={t.x}
                    y={t.y}
                    fontSize={t.fontSize}
                    isVisited={visitedProvinces.has(t.id)}
                    isSelected={selectedProvince === t.id}
                  />
                ))}
              </svg>
            </div>

            {/* ===== 点击弹窗（fixed 定位 + 边界避让） ===== */}
            {selectedProvince && (
              <ProvincePopup
                province={selectedProvince}
                footprints={footprintsByProvince[selectedProvince] || []}
                anchorX={popupPos.x}
                anchorY={popupPos.y}
                onClose={() => setSelectedProvince(null)}
              />
            )}

            {/* 图例 */}
            <div
              className="flex items-center justify-center gap-5 mt-5 flex-wrap py-3 px-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.5)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-lg"
                  style={{ background: "#fff", border: "2px solid #222" }}
                />
                <span className="text-xs pixel-text" style={{ color: "#555" }}>
                  未到访
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                    border: "2px solid #222",
                    boxShadow: "0 2px 6px rgba(255,217,61,0.4)",
                  }}
                />
                <span className="text-xs pixel-text" style={{ color: "#555" }}>
                  已到访
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #FF9EBD 0%, #FF6B9D 100%)",
                    border: "2px solid #222",
                    boxShadow: "0 2px 6px rgba(255,107,157,0.4)",
                  }}
                />
                <span className="text-xs pixel-text" style={{ color: "#555" }}>
                  当前选中
                </span>
              </div>
            </div>
          </div>

          {/* 提示 */}
          <p
            className="text-center text-xs pixel-text mt-4"
            style={{ color: "rgba(0,0,0,0.4)" }}
          >
            💡 悬停省份高亮 · 点击查看详情 · 已到访 {totalProvinces}/33，加油继续加油～
          </p>
        </main>

        {/* ===== 总览弹窗 ===== */}
        {showOverview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowOverview(false)}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[28px] flex flex-col animate-float-up"
              style={{
                background: "#fff",
                border: "3px solid #FFD93D",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 弹窗标题 */}
              <div
                className="px-6 py-4 flex items-center justify-between relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #FFE866 0%, #FFD93D 70%, #FFB8C9 100%)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-400" />
                <h2 className="text-xl font-bold pixel-text flex items-center gap-2" style={{ color: "#222" }}>
                  📋  Foot Prints总览
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-normal">
                    共 {totalCities} 条
                  </span>
                </h2>
                <button
                  onClick={() => setShowOverview(false)}
                  className="w-9 h-9 rounded-full pixel-text font-bold hover:bg-black/10 transition-all flex items-center justify-center"
                  style={{ color: "#222" }}
                >
                  ✕
                </button>
              </div>

              {/* 弹窗内容 */}
              <div className="flex-1 overflow-y-auto p-6" style={{ background: "#FFFDF5" }}>
                {footprints.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">🗺️</p>
                    <p className="pixel-text" style={{ color: "#999" }}>
                      还没有 Foot Prints，等着一起去探索吧～
                    </p>
                  </div>
                ) : (
                  <div className="space-y-7">
                    {/* 按年月分组（footprints 已按新→旧排序） */}
                    {Array.from(
                      new Set(
                        footprints.map(
                          (f) => `${f.visit_year}-${String(f.visit_month).padStart(2, "0")}`
                        )
                      )
                    ).map((monthKey, grpIdx) => {
                      const [y, m] = monthKey.split("-");
                      const items = footprints.filter(
                        (f) =>
                          f.visit_year === parseInt(y) &&
                          f.visit_month === parseInt(m)
                      );
                      return (
                        <div
                          key={monthKey}
                          className="animate-float-up"
                          style={{ animationDelay: `${grpIdx * 50}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="px-3.5 py-1.5 rounded-xl font-bold pixel-text flex items-center gap-2"
                              style={{
                                background: "linear-gradient(135deg, #FFD93D 0%, #FFC83D 100%)",
                                color: "#222",
                                boxShadow: "0 2px 8px rgba(255,217,61,0.4)",
                              }}
                            >
                              📅 {y}年{parseInt(m)}月
                            </div>
                            <div
                              className="flex-1 h-[2px]"
                              style={{
                                background: "linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0))",
                              }}
                            />
                            <p
                              className="text-xs pixel-text"
                              style={{ color: "#999" }}
                            >
                              {items.length} 个城市
                            </p>
                          </div>
                          <div className="space-y-2">
                            {items.map((f) => (
                              <div
                                key={f.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl group hover:scale-[1.01] transition-transform"
                                style={{
                                  background: "rgba(255,255,255,0.9)",
                                  border: "1.5px solid rgba(0,0,0,0.05)",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                }}
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                  style={{
                                    background: "linear-gradient(135deg, #FFE5EC 0%, #FFD1DC 100%)",
                                  }}
                                >
                                  📍
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-bold pixel-text"
                                    style={{ color: "#222" }}
                                  >
                                    {f.province} · {f.city}
                                  </p>
                                  {f.note && (
                                    <p
                                      className="text-xs pixel-text mt-0.5 truncate"
                                      style={{ color: "#666" }}
                                    >
                                      💭 {f.note}
                                    </p>
                                  )}
                                </div>
                                <p
                                  className="text-xs pixel-text whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full"
                                  style={{
                                    color: "#888",
                                    background: "rgba(0,0,0,0.04)",
                                  }}
                                >
                                  {f.visit_year}.{String(f.visit_month).padStart(2, "0")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 淡入 keyframes */}
        <style jsx global>{`
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

// ========== 省份弹窗（fixed 定位，自动避让边界） ==========
function ProvincePopup({
  province,
  footprints,
  anchorX,
  anchorY,
  onClose,
}: {
  province: string;
  footprints: Footprint[];
  anchorX: number;
  anchorY: number;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!popupRef.current) return;
    const el = popupRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    // 水平：居中于锚点后左移 170px，但不超出视口
    let x = anchorX - w / 2 - 170;
    x = Math.max(margin, Math.min(x, vw - w - margin));

    // 垂直：优先放在上方，如果上方空间不够则放在下方，整体下移 30px
    let y = anchorY - h - 12 + 30;
    if (y < margin) {
      y = anchorY + 12 + 30;
    }
    // 如果下方也不够，就贴紧底部
    if (y + h > vh - margin) {
      y = vh - h - margin;
    }

    setPos({ x, y });
  }, [anchorX, anchorY, footprints.length]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 p-4 rounded-[22px] shadow-2xl animate-fade-in"
      style={{
        left: pos.x,
        top: pos.y,
        minWidth: 250,
        maxWidth: 320,
        maxHeight: "70vh",
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(20px)",
        border: "2.5px solid #FFD93D",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute -top-2.5 left-5 right-5 h-1 rounded-full"
        style={{
          background: "linear-gradient(90deg, #FFD93D, #FFB8C9, #FFD93D)",
        }}
      />
      <p
        className="font-bold pixel-text mb-3 flex items-center gap-2 sticky top-0 py-1"
        style={{ color: "#222", background: "rgba(255,255,255,0.98)" }}
      >
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
          style={{ background: "linear-gradient(135deg, #FFE866, #FFD93D)" }}
        >📍</span>
        <span className="text-lg">{province}</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
          style={{
            background: footprints.length > 0 ? "rgba(255,217,61,0.35)" : "rgba(0,0,0,0.06)",
            color: "#222",
          }}
        >
          {footprints.length} 城
        </span>
      </p>

      {footprints.length > 0 ? (
        <div className="space-y-2 overflow-y-auto pr-0.5" style={{ maxHeight: "calc(70vh - 85px)" }}>
          {footprints.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
              style={{ background: "linear-gradient(135deg, rgba(255,232,102,0.12), rgba(255,184,201,0.1))",
                border: "1px solid rgba(255,217,61,0.25)"
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold pixel-text text-sm truncate"
                  style={{ color: "#222" }}
                >
                  🏙️ {f.city}
                </p>
                {f.note && (
                  <p
                    className="text-xs pixel-text truncate mt-0.5"
                    style={{ color: "#666" }}
                  >
                    💭 {f.note}
                  </p>
                )}
              </div>
              <p
                className="text-xs pixel-text whitespace-nowrap px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  color: "#666",
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {f.visit_year}.{String(f.visit_month).padStart(2, "0")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center">
          <div className="text-3xl mb-2 opacity-50">🌱</div>
          <p className="text-xs pixel-text" style={{ color: "#aaa" }}>
            还没有一起去过呢...
          </p>
        </div>
      )}
    </div>
  );
}

// ========== memo 化的省份路径组件 ==========
const ProvincePath = memo(function ProvincePath({
  provinceId,
  pathD,
  isVisited,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: {
  provinceId: string;
  pathD: string;
  isVisited: boolean;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  let fill = "#ffffff";
  let filter = "none";
  if (isSelected) {
    fill = "url(#selectedGradient)";
    filter = "drop-shadow(0 0 10px rgba(255,107,157,0.55))";
  } else if (isVisited) {
    fill = "url(#visitedGradient)";
    filter = isHovered ? "drop-shadow(0 3px 8px rgba(255,217,61,0.45))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.08))";
  } else if (isHovered) {
    fill = "#FFF0F0";
    filter = "drop-shadow(0 2px 6px rgba(0,0,0,0.15))";
  }

  const handleMouseEnter = useCallback(() => onHover(provinceId), [provinceId, onHover]);
  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(provinceId);
    },
    [provinceId, onClick]
  );

  return (
    <>
      <defs>
        <linearGradient id="visitedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE866" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
        <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9EBD" />
          <stop offset="100%" stopColor="#FF6B9D" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill={fill}
        stroke="#222"
        strokeWidth="3"
        strokeLinejoin="round"
        className="cursor-pointer"
        style={{
          transition: "fill 0.15s ease, filter 0.15s ease",
          filter,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </>
  );
});

// ========== memo 化的省份文字组件 ==========
const ProvinceText = memo(function ProvinceText({
  provinceId,
  text,
  x,
  y,
  fontSize,
  isVisited,
  isSelected,
}: {
  provinceId: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  isVisited: boolean;
  isSelected: boolean;
}) {
  const fill = isSelected ? "#fff" : isVisited ? "#78350f" : "#222";
  return (
    <text
      x={x + 20}
      y={y - 3}
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none select-none"
      style={{
        fontSize: `${Math.round(fontSize * 0.7)}px`,
        fontWeight: "bold",
        fill,
        fontFamily: "monospace, sans-serif",
        paintOrder: isSelected ? "stroke" : undefined,
        stroke: isSelected ? "rgba(255,107,157,0.25)" : undefined,
        strokeWidth: isSelected ? 2 : 0,
      }}
    >
      {text}
    </text>
  );
});
