"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";
import Link from "next/link";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center">
        <div className="flex items-end gap-4 mb-6">
          <Bunny size={80} />
          <Hamster size={88} />
        </div>
        <p className="text-pixel-brown/60 pixel-text">正在进入管理后台...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 非管理员提示
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-4">
        <div className="flex items-end gap-4 mb-6">
          <Bunny size={80} />
          <Hamster size={88} />
        </div>
        <p className="text-xl font-bold text-pixel-brown pixel-text mb-2">
          无权访问
        </p>
        <p className="text-pixel-brown/60 pixel-text mb-6 text-center">
          只有管理员才能进入管理后台哦
        </p>
        <Link
          href="/"
          className="glass-btn px-6 py-2 text-pixel-brown pixel-text font-bold"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
