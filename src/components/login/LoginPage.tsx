"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("密码至少需要 6 位字符");
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await signIn(username, password);

    if (signInError) {
      console.error("登录失败:", signInError);
      if (signInError.message?.includes("Invalid")) {
        setError("用户名或密码错误，请重试");
      } else {
        setError(signInError.message || "登录失败，请稍后重试");
      }
    } else {
      router.push("/");
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 page-theme-bg overflow-hidden relative">
      {/* 顶部小装饰标签 */}
      <div className="absolute top-8 pixel-text text-[11px] tracking-[0.4em] text-pixel-pink/55 animate-float-up">
        ✦  MEMORY · SPACE  ✦
      </div>

      {/* 顶部角色 */}
      <div className="flex items-end gap-4 mb-7 relative z-10 animate-float-up animate-float-up-delay-1">
        <div className="transition-transform hover:-translate-y-2 duration-500">
          <Bunny size={108} />
        </div>
        <div className="relative pb-1">
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-20 h-2 bg-gradient-to-r from-transparent via-pixel-yellow/50 to-transparent rounded-full blur-[2px]" />
        </div>
        <div className="transition-transform hover:-translate-y-2 duration-500">
          <Hamster size={118} />
        </div>
      </div>

      {/* 标题 */}
      <div className="relative z-10 text-center mb-8 animate-float-up animate-float-up-delay-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-pixel-brown pixel-display mb-2">
          Playground
        </h1>
        <p className="text-pixel-brown/55 pixel-text text-sm leading-loose">
          欢迎回来，请登录进入我们的数字空间 💫
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="glass-card px-5 py-3.5 mb-6 w-full max-w-sm relative z-10 animate-float-up !bg-gradient-to-br !from-rose-100/85 !to-pink-50/70 !border !border-rose-200/70"
             style={{ boxShadow: "0 8px 28px -8px rgba(244,63,94,0.28), inset 0 1px 0 0 rgba(255,255,255,0.9)" }}>
          <p className="text-rose-600 text-sm pixel-text font-bold flex items-center gap-2">
            <span>🌷</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* 登录表单 - 液态玻璃 */}
      <div className="glass-card p-8 sm:p-9 w-full max-w-sm relative z-10 animate-float-up animate-float-up-delay-3">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold pixel-text text-pixel-brown/70 mb-2.5 tracking-widest pl-1">
              · USERNAME ·
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="glass-input w-full px-4 py-3.5 pixel-text text-sm"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold pixel-text text-pixel-brown/70 mb-2.5 tracking-widest pl-1">
              · PASSWORD ·
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="glass-input w-full px-4 py-3.5 pixel-text text-sm"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="glass-btn w-full py-3.5 px-6 font-bold text-pixel-brown pixel-text tracking-wider !bg-gradient-to-br !from-pixel-yellow/65 !to-pixel-pink/40 hover:!from-pixel-yellow/75"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-pixel-brown/40 border-t-pixel-brown animate-spin" />
                <span>登录中…</span>
              </span>
            ) : (
              "·  登  录  ·"
            )}
          </button>
        </form>
      </div>

      {/* 返回首页 */}
      <Link
        href="/"
        className="mt-9 text-sm text-pixel-brown/55 hover:text-pixel-pink transition-colors pixel-text relative z-10 animate-float-up animate-float-up-delay-4 flex items-center gap-2 group"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
        <span>返回首页</span>
      </Link>

      {/* 底部装饰 */}
      <div className="mt-14 text-center text-pixel-brown/35 text-xs relative z-10 animate-float-up animate-float-up-delay-5">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
          <span>🐰</span>
          <span className="w-16 h-px bg-gradient-to-r from-transparent via-pixel-brown/20 to-transparent" />
          <span>🐹</span>
        </div>
        <p className="pixel-text tracking-[0.25em]">PROTECTED  BY  BUNNY  &  HAMSTER</p>
      </div>
    </main>
  );
}
