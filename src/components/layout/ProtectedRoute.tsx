"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Bunny from "@/components/characters/Bunny";
import Hamster from "@/components/characters/Hamster";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
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
        <p className="text-pixel-brown/60 pixel-text">正在进入Playground...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
