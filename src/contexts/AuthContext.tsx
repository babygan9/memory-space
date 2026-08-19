"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/database";

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef<Promise<void> | null>(null);

  // 仅用户 jcqs 为管理员
  const isAdmin = profile?.username === "jcqs";

  // 拉取 profile：用 in-flight 去重，避免并发触发多次查询
  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) {
      await fetchingRef.current;
      return;
    }
    const task = (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("获取用户资料失败:", error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("获取用户资料异常:", error);
      } finally {
        setLoading(false);
        fetchingRef.current = null;
      }
    })();
    fetchingRef.current = task;
    await task;
  }, []);

  useEffect(() => {
    let mounted = true;

    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (username: string, password: string) => {
    const email = `${username}@memory.space`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ===== 关键：稳定 context value，避免每次渲染导致所有 consumers 重绘 =====
  const value = useMemo<AuthContextType>(
    () => ({ user, profile, loading, isAdmin, signIn, signOut }),
    [user, profile, loading, isAdmin, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
