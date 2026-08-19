"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import { getMembers, formatDate, type MemberWithProfile } from "@/lib/api";
import { getUserDisplay, getDisplayFromProfile } from "@/lib/userDisplay";

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getMembers();
      setMembers(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream-100">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-8 animate-float-up">
            <div>
              <h1 className="text-3xl font-bold text-pixel-brown pixel-text flex items-center gap-2">
                👥 About us
              </h1>
              <p className="text-sm text-pixel-brown/60 pixel-text mt-1.5">
                
                {!loading && members.length > 0 && (
                  <span className="ml-2">· 共 {members.length} 人</span>
                )}
              </p>
            </div>
            <div className="flex gap-1">
              <Bunny size={50} />
              <Hamster size={55} />
            </div>
          </div>

          {/* 加载骨架屏 */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-card p-5 rounded-[28px] flex items-center gap-4 animate-float-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-16 h-16 rounded-full skeleton-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-24 skeleton-shimmer rounded" />
                    <div className="h-3 w-32 skeleton-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About us列表 */}
          {!loading && (
            <div className="space-y-4">
              {members.map((member, i) => {
                const display = getDisplayFromProfile(member.profiles);
                const isOwner = member.role === "owner";
                return (
                  <div
                    key={member.id}
                    className="glass-card rounded-[28px] p-5 flex items-center gap-4 animate-float-up relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      animationDelay: `${80 + i * 80}ms`,
                      boxShadow: isOwner
                        ? "0 8px 24px rgba(255,107,157,0.18), 0 2px 6px rgba(0,0,0,0.04)"
                        : "0 4px 14px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* 顶部装饰条 */}
                    {isOwner && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400" />
                    )}

                    {/* 角落装饰 */}
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full transition-opacity group-hover:opacity-80"
                      style={{
                        background: isOwner
                          ? "rgba(255,107,157,0.12)"
                          : "rgba(255,217,61,0.1)",
                        filter: "blur(20px)",
                        opacity: 0.6,
                      }}
                    />

                    {/* 头像 */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 relative"
                      style={{
                        background: isOwner
                          ? "linear-gradient(135deg, #FFB8C9 0%, #FF9EBD 50%, #FF6B9D 100%)"
                          : "linear-gradient(135deg, #FFE866 0%, #FFD93D 100%)",
                        boxShadow: isOwner
                          ? "0 4px 14px rgba(255,107,157,0.4), inset 0 1px 0 rgba(255,255,255,0.3)"
                          : "0 4px 14px rgba(255,217,61,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                      }}
                    >
                      {display.avatar}
                      {/* 角色小徽标 */}
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{
                          background: "#fff",
                          border: `2px solid ${isOwner ? "#FF6B9D" : "#FFD93D"}`,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      >
                        {isOwner ? "👑" : "✨"}
                      </div>
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="font-bold text-pixel-brown pixel-text text-xl leading-tight">
                          {display.nickname}
                        </p>
                        {isOwner && (
                          <span
                            className="px-2.5 py-0.5 text-xs rounded-full pixel-text font-bold text-white"
                            style={{
                              background: "linear-gradient(135deg, #FF9EBD 0%, #FF6B9D 100%)",
                              boxShadow: "0 2px 6px rgba(255,107,157,0.35)",
                            }}
                          >
                            圆兔の老公
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs pixel-text text-pixel-brown/50">
                        <span>🏠 加入于 {formatDate(member.joined_at)}</span>
                        {member.profiles?.username && (
                          <>
                            <span className="opacity-40">·</span>
                            <span>@{member.profiles.username}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 右侧装饰 */}
                    <div className="text-4xl opacity-60 flex-shrink-0 hidden sm:block">
                      {isOwner ? "💖" : "🌈"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 空状态 */}
          {!loading && members.length === 0 && (
            <div className="glass-card rounded-[28px] py-20 text-center animate-float-up">
              <div className="text-6xl mb-4 inline-block animate-bounce" style={{ animationDuration: "3s" }}>
                👥
              </div>
              <p className="text-pixel-brown/70 pixel-text mb-2 text-lg">还没有About us</p>
              <p className="text-sm text-pixel-brown/50 pixel-text">
                
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
