"use client";

import { supabase } from "./supabase";
import type { Moment, Article, Comment, UserProfile, Countdown, Footprint } from "@/types/database";

// 缓存当前用户的空间 ID & 进行中的 Promise（in-flight 去重）
let cachedSpaceId: string | null = null;
let cachedSpaceUserId: string | null = null;
let spaceIdPromise: Promise<string | null> | null = null;

// 获取当前用户所属的空间 ID
export async function getCurrentSpaceId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const uid = userData.user.id;

  // 如果缓存的 user id 对不上，清缓存
  if (cachedSpaceUserId && cachedSpaceUserId !== uid) {
    cachedSpaceId = null;
    spaceIdPromise = null;
  }
  cachedSpaceUserId = uid;
  if (cachedSpaceId) return cachedSpaceId;
  if (spaceIdPromise) return spaceIdPromise;

  spaceIdPromise = (async () => {
    const { data, error } = await supabase
      .from("memberships")
      .select("space_id")
      .eq("user_id", uid)
      .limit(1)
      .single();

    if (error || !data) {
      console.error("获取用户空间失败:", error);
      spaceIdPromise = null;
      return null;
    }
    cachedSpaceId = data.space_id;
    return cachedSpaceId;
  })();

  const res = await spaceIdPromise;
  spaceIdPromise = null;
  return res;
}

// ===== Post Moments =====

export async function getMoments(): Promise<Moment[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  // 1. 查询 moments 基础数据
  const { data: moments, error: momentsError } = await supabase
    .from("moments")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });

  if (momentsError || !moments || moments.length === 0) {
    if (momentsError) console.error("获取Post失败:", momentsError);
    return [];
  }

  // 2. 收集 ids，然后 PROFILES / PHOTOS / EDIT_HISTORY 三个请求并发！
  const authorIds = Array.from(new Set(moments.map((m: any) => m.author_id)));
  const momentIds = moments.map((m: any) => m.id);

  const [{ data: profiles }, { data: photos }, { data: editHistory }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, nickname, avatar_url")
      .in("id", authorIds),
    supabase
      .from("photos")
      .select("id, owner_id, url, created_at")
      .eq("owner_type", "moment")
      .in("owner_id", momentIds),
    supabase
      .from("edit_history")
      .select("*")
      .eq("target_type", "moment")
      .in("target_id", momentIds)
      .order("edited_at", { ascending: true }),
  ]);

  const profileMap: Record<string, any> = {};
  profiles?.forEach((p: any) => {
    profileMap[p.id] = p;
  });

  const photoMap: Record<string, any[]> = {};
  photos?.forEach((p: any) => {
    if (!photoMap[p.owner_id]) photoMap[p.owner_id] = [];
    photoMap[p.owner_id].push(p);
  });

  const editHistoryMap: Record<string, any[]> = {};
  editHistory?.forEach((e: any) => {
    if (!editHistoryMap[e.target_id]) editHistoryMap[e.target_id] = [];
    editHistoryMap[e.target_id].push(e);
  });

  return moments.map((m: any) => ({
    ...m,
    profiles: profileMap[m.author_id] || null,
    photos: photoMap[m.id] || [],
    edit_history: editHistoryMap[m.id] || [],
  }));
}

export async function getMomentById(id: string): Promise<Moment | null> {
  // 1. 查询 moment 基础数据
  const { data: moment, error: momentError } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .single();

  if (momentError || !moment) {
    console.error("获取Post详情失败:", momentError);
    return null;
  }

  // 2. profile / photos / edit_history 三个请求并发
  const [{ data: profile }, { data: photos }, { data: editHistory }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, nickname, avatar_url")
      .eq("id", moment.author_id)
      .single(),
    supabase
      .from("photos")
      .select("id, owner_id, url, created_at")
      .eq("owner_type", "moment")
      .eq("owner_id", id),
    supabase
      .from("edit_history")
      .select("*")
      .eq("target_type", "moment")
      .eq("target_id", id)
      .order("edited_at", { ascending: true }),
  ]);

  return {
    ...moment,
    profiles: profile || null,
    photos: photos || [],
    edit_history: editHistory || [],
  };
}

export async function createMoment(content: string, photoUrls: string[] = []): Promise<Moment | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return null;

  const { data, error } = await supabase
    .from("moments")
    .insert({
      space_id: spaceId,
      author_id: userData.user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("创建Post失败:", error);
    return null;
  }

  // 上传关联的Photo
  if (photoUrls.length > 0 && data) {
    const photoInserts = photoUrls.map((url) => ({
      owner_type: "moment" as const,
      owner_id: data.id,
      url,
    }));

    const { error: photoError } = await supabase
      .from("photos")
      .insert(photoInserts);

    if (photoError) {
      console.error("保存Photo失败:", photoError);
    }
  }

  return data as Moment;
}

// ===== Photo上传 =====

export async function uploadPhoto(file: File): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(fileName, file);

  if (error) {
    console.error("上传Photo失败:", error);
    return null;
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
  return data?.publicUrl || null;
}

// ===== Comments   Comments =====

export async function getComments(targetType: "moment" | "article", targetId: string): Promise<Comment[]> {
  // 1. 查询Comments基础数据
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  if (commentsError || !comments || comments.length === 0) {
    if (commentsError) console.error("获取Comments失败:", commentsError);
    return [];
  }

  // 2. 收集所有 author_id 并发查询 profiles
  const authorIds = Array.from(new Set(comments.map((c: any) => c.author_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, nickname, avatar_url")
    .in("id", authorIds);

  const profileMap: Record<string, any> = {};
  profiles?.forEach((p: any) => {
    profileMap[p.id] = p;
  });

  return comments.map((c: any) => ({
    ...c,
    profiles: profileMap[c.author_id] || null,
  }));
}

export async function createComment(
  targetType: "moment" | "article",
  targetId: string,
  content: string
): Promise<Comment | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("comments")
    .insert({
      target_type: targetType,
      target_id: targetId,
      author_id: userData.user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("创建Comments  失败:", error);
    return null;
  }

  return data as Comment;
}

// ===== 用户 Profiles =====

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.error("获取用户资料失败:", error);
    return null;
  }

  return data as UserProfile;
}

// ===== 时间格式化 =====

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 按年月分组
export function groupMomentsByMonth(moments: Moment[]): Record<string, Moment[]> {
  const groups: Record<string, Moment[]> = {};

  moments.forEach((moment) => {
    const date = new Date(moment.created_at);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(moment);
  });

  return groups;
}

// ===== About us Members =====

export interface MemberWithProfile {
  id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profiles: {
    id: string;
    nickname: string;
    avatar_url: string | null;
    username: string;
  } | null;
}

export async function getMembers(): Promise<MemberWithProfile[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  // 1. 查询About us关系
  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: true });

  if (membershipsError || !memberships || memberships.length === 0) {
    if (membershipsError) console.error("获取About us列表失败:", membershipsError);
    return [];
  }

  // 2. 并发查询用户资料
  const userIds = memberships.map((m: any) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, username")
    .in("id", userIds);

  const profileMap: Record<string, any> = {};
  profiles?.forEach((p: any) => {
    profileMap[p.id] = p;
  });

  return memberships.map((m: any) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    joined_at: m.created_at,
    profiles: profileMap[m.user_id] || null,
  }));
}

// ===== Letters Articles =====

export async function getArticles(): Promise<Article[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  // 1. 查询 articles 基础数据
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });

  if (articlesError || !articles || articles.length === 0) {
    if (articlesError) console.error("获取Letters失败:", articlesError);
    return [];
  }

  // 2. 收集 ids，三个子查询并发
  const authorIds = Array.from(new Set(articles.map((a: any) => a.author_id)));
  const articleIds = articles.map((a: any) => a.id);

  const [{ data: profiles }, { data: photos }, { data: editHistory }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, nickname, avatar_url")
      .in("id", authorIds),
    supabase
      .from("photos")
      .select("id, owner_id, url, created_at")
      .eq("owner_type", "article")
      .in("owner_id", articleIds),
    supabase
      .from("edit_history")
      .select("*")
      .eq("target_type", "article")
      .in("target_id", articleIds)
      .order("edited_at", { ascending: true }),
  ]);

  const profileMap: Record<string, any> = {};
  profiles?.forEach((p: any) => {
    profileMap[p.id] = p;
  });

  const photoMap: Record<string, any[]> = {};
  photos?.forEach((p: any) => {
    if (!photoMap[p.owner_id]) photoMap[p.owner_id] = [];
    photoMap[p.owner_id].push(p);
  });

  const editHistoryMap: Record<string, any[]> = {};
  editHistory?.forEach((e: any) => {
    if (!editHistoryMap[e.target_id]) editHistoryMap[e.target_id] = [];
    editHistoryMap[e.target_id].push(e);
  });

  return articles.map((a: any) => ({
    ...a,
    profiles: profileMap[a.author_id] || null,
    photos: photoMap[a.id] || [],
    edit_history: editHistoryMap[a.id] || [],
  }));
}

export async function getArticleById(id: string): Promise<Article | null> {
  // 1. 查询 article 基础数据
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (articleError || !article) {
    console.error("获取Letters详情失败:", articleError);
    return null;
  }

  // 2. profile / photos / edit_history 三个请求并发
  const [{ data: profile }, { data: photos }, { data: editHistory }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, nickname, avatar_url")
      .eq("id", article.author_id)
      .single(),
    supabase
      .from("photos")
      .select("id, owner_id, url, created_at")
      .eq("owner_type", "article")
      .eq("owner_id", id),
    supabase
      .from("edit_history")
      .select("*")
      .eq("target_type", "article")
      .eq("target_id", id)
      .order("edited_at", { ascending: true }),
  ]);

  return {
    ...article,
    profiles: profile || null,
    photos: photos || [],
    edit_history: editHistory || [],
  };
}

export async function createArticle(
  title: string,
  content: string,
  photoUrls: string[] = []
): Promise<Article | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return null;

  const { data, error } = await supabase
    .from("articles")
    .insert({
      space_id: spaceId,
      author_id: userData.user.id,
      title,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("创建Letters失败:", error);
    return null;
  }

  // 上传关联的Photo
  if (photoUrls.length > 0 && data) {
    const photoInserts = photoUrls.map((url) => ({
      owner_type: "article" as const,
      owner_id: data.id,
      url,
    }));

    const { error: photoError } = await supabase
      .from("photos")
      .insert(photoInserts);

    if (photoError) {
      console.error("保存Photo失败:", photoError);
    }
  }

  return data as Article;
}

// 按年月分组Letters
export function groupArticlesByMonth(articles: Article[]): Record<string, Article[]> {
  const groups: Record<string, Article[]> = {};

  articles.forEach((article) => {
    const date = new Date(article.created_at);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(article);
  });

  return groups;
}

// ===== Pinterest - 所有Photo =====

export interface PhotoWithOwner {
  id: string;
  url: string;
  owner_type: "moment" | "article";
  owner_id: string;
  created_at: string;
}

export async function getAllPhotos(): Promise<PhotoWithOwner[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  // 1. 查询所有 moments 和 articles 的 ID（并发）
  const [{ data: moments }, { data: articles }] = await Promise.all([
    supabase.from("moments").select("id").eq("space_id", spaceId),
    supabase.from("articles").select("id").eq("space_id", spaceId),
  ]);

  const momentIds = moments?.map((m: any) => m.id) || [];
  const articleIds = articles?.map((a: any) => a.id) || [];

  if (momentIds.length === 0 && articleIds.length === 0) return [];

  // 2. 查询两类Photo（并发，不必串行）
  const allPhotos: PhotoWithOwner[] = [];

  const momentPromise =
    momentIds.length > 0
      ? supabase
          .from("photos")
          .select("id, url, owner_type, owner_id, created_at")
          .eq("owner_type", "moment")
          .in("owner_id", momentIds)
          .order("created_at", { ascending: false })
      : null;

  const articlePromise =
    articleIds.length > 0
      ? supabase
          .from("photos")
          .select("id, url, owner_type, owner_id, created_at")
          .eq("owner_type", "article")
          .in("owner_id", articleIds)
          .order("created_at", { ascending: false })
      : null;

  const results = await Promise.all(
    [momentPromise, articlePromise].filter(
      (p): p is NonNullable<typeof p> => p !== null
    )
  );

  results.forEach(({ data }) => {
    if (data) allPhotos.push(...(data as PhotoWithOwner[]));
  });

  // 3. 按时间倒序排序
  allPhotos.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allPhotos;
}

// ===== 管理员统计 =====

export interface SpaceStats {
  momentCount: number;
  articleCount: number;
  photoCount: number;
  commentCount: number;
  memberCount: number;
}

export async function getSpaceStats(): Promise<SpaceStats> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) {
    return { momentCount: 0, articleCount: 0, photoCount: 0, commentCount: 0, memberCount: 0 };
  }

  // 并行：3 个 count + 2 个 id 查询，全部同时发！
  const [
    { count: momentCount },
    { count: articleCount },
    { count: memberCount },
    { data: moments },
    { data: articles },
  ] = await Promise.all([
    supabase.from("moments").select("*", { count: "exact", head: true }).eq("space_id", spaceId),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("space_id", spaceId),
    supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("space_id", spaceId),
    supabase.from("moments").select("id").eq("space_id", spaceId),
    supabase.from("articles").select("id").eq("space_id", spaceId),
  ]);

  const momentIds = moments?.map((m: any) => m.id) || [];
  const articleIds = articles?.map((a: any) => a.id) || [];
  const allOwnerIds = [...momentIds, ...articleIds];

  let photoCount = 0;
  let commentCount = 0;

  if (allOwnerIds.length > 0) {
    const [{ count: pCount }, { count: cCount }] = await Promise.all([
      supabase.from("photos").select("*", { count: "exact", head: true }).in("owner_id", allOwnerIds),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .in("target_id", allOwnerIds),
    ]);
    photoCount = pCount || 0;
    commentCount = cCount || 0;
  }

  return {
    momentCount: momentCount || 0,
    articleCount: articleCount || 0,
    photoCount,
    commentCount,
    memberCount: memberCount || 0,
  };
}

// ===== 管理员：编辑与删除 =====

// 更新Post
export async function updateMoment(
  id: string,
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from("moments")
    .update({ content })
    .eq("id", id);

  if (error) {
    console.error("更新Post失败:", error);
    return false;
  }

  // 记录编辑历史
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase.from("edit_history").insert({
      target_type: "moment",
      target_id: id,
      editor_id: userData.user.id,
    });
  }

  return true;
}

// 删除Post（级联删除关联的Photo和Comments  ）
export async function deleteMoment(id: string): Promise<boolean> {
  // 先删Photo和Comments  
  await Promise.all([
    supabase.from("photos").delete().eq("owner_type", "moment").eq("owner_id", id),
    supabase.from("comments").delete().eq("target_type", "moment").eq("target_id", id),
  ]);

  const { error } = await supabase.from("moments").delete().eq("id", id);
  if (error) {
    console.error("删除Post失败:", error);
    return false;
  }
  return true;
}

// 更新Letters
export async function updateArticle(
  id: string,
  title: string,
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from("articles")
    .update({ title, content })
    .eq("id", id);

  if (error) {
    console.error("更新Letters失败:", error);
    return false;
  }

  // 记录编辑历史
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    await supabase.from("edit_history").insert({
      target_type: "article",
      target_id: id,
      editor_id: userData.user.id,
    });
  }

  return true;
}

// 删除Letters（级联删除关联的照片和Comments  ）
export async function deleteArticle(id: string): Promise<boolean> {
  await Promise.all([
    supabase.from("photos").delete().eq("owner_type", "article").eq("owner_id", id),
    supabase.from("comments").delete().eq("target_type", "article").eq("target_id", id),
  ]);

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    console.error("删除Letters失败:", error);
    return false;
  }
  return true;
}

// 删除Comments  
export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    console.error("删除Comments  失败:", error);
    return false;
  }
  return true;
}

// 更新About us资料（昵称和头像）
export async function updateProfile(
  userId: string,
  nickname: string,
  avatarUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) {
    console.error("更新About us资料失败:", error);
    return false;
  }
  return true;
}

// 获取所有Comments（带作者信息）
export async function getAllComments(): Promise<Comment[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  // 1. 先拿所有 moment 和 article 的 id（并发）
  const [{ data: moments }, { data: articles }] = await Promise.all([
    supabase.from("moments").select("id").eq("space_id", spaceId),
    supabase.from("articles").select("id").eq("space_id", spaceId),
  ]);

  const momentIds = moments?.map((m: any) => m.id) || [];
  const articleIds = articles?.map((a: any) => a.id) || [];
  const allTargetIds = [...momentIds, ...articleIds];

  if (allTargetIds.length === 0) return [];

  // 2. 查询所有Comments
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .in("target_id", allTargetIds)
    .order("created_at", { ascending: false });

  if (commentsError || !comments || comments.length === 0) {
    if (commentsError) console.error("获取Comments失败:", commentsError);
    return [];
  }

  // 3. 查询作者信息
  const authorIds = Array.from(new Set(comments.map((c: any) => c.author_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, username")
    .in("id", authorIds);

  const profileMap: Record<string, any> = {};
  profiles?.forEach((p: any) => {
    profileMap[p.id] = p;
  });

  return comments.map((c: any) => ({
    ...c,
    profiles: profileMap[c.author_id] || null,
  }));
}

// ===== Days Countdowns =====

export async function getCountdowns(): Promise<Countdown[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  const { data, error } = await supabase
    .from("countdowns")
    .select("*")
    .eq("space_id", spaceId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取Days失败:", error);
    return [];
  }

  return (data as Countdown[]) || [];
}

export async function createCountdown(
  title: string,
  targetDate: string,
  icon: string = "🎉",
  color: string = "pink"
): Promise<Countdown | null> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return null;

  const { data, error } = await supabase
    .from("countdowns")
    .insert({
      space_id: spaceId,
      title,
      target_date: targetDate,
      icon,
      color,
    })
    .select()
    .single();

  if (error) {
    console.error("创建Days失败:", error);
    return null;
  }

  return data as Countdown;
}

export async function updateCountdown(
  id: string,
  title: string,
  targetDate: string,
  icon: string,
  color: string
): Promise<boolean> {
  const { error } = await supabase
    .from("countdowns")
    .update({ title, target_date: targetDate, icon, color })
    .eq("id", id);

  if (error) {
    console.error("更新Days失败:", error);
    return false;
  }
  return true;
}

export async function deleteCountdown(id: string): Promise<boolean> {
  const { error } = await supabase.from("countdowns").delete().eq("id", id);

  if (error) {
    console.error("删除Days失败:", error);
    return false;
  }
  return true;
}

// =====  Foot Prints Footprints =====

export async function getFootprints(): Promise<Footprint[]> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return [];

  const { data, error } = await supabase
    .from("footprints")
    .select("*")
    .eq("space_id", spaceId)
    .order("visit_year", { ascending: false })
    .order("visit_month", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("获取 Foot Prints失败:", error);
    return [];
  }

  return (data as Footprint[]) || [];
}

export async function createFootprint(
  province: string,
  city: string,
  visitYear: number,
  visitMonth: number,
  note?: string
): Promise<Footprint | null> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return null;

  // 计算同年月最大 sort_order + 1
  const { data: existing } = await supabase
    .from("footprints")
    .select("sort_order")
    .eq("space_id", spaceId)
    .eq("visit_year", visitYear)
    .eq("visit_month", visitMonth)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxSort = existing && existing.length > 0 ? (existing[0] as any).sort_order : 0;
  const sortOrder = (maxSort || 0) + 1;

  const { data, error } = await supabase
    .from("footprints")
    .insert({
      space_id: spaceId,
      province,
      city,
      visit_year: visitYear,
      visit_month: visitMonth,
      sort_order: sortOrder,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("创建 Foot Prints失败:", error);
    return null;
  }

  return data as Footprint;
}

export async function updateFootprint(
  id: string,
  province: string,
  city: string,
  visitYear: number,
  visitMonth: number,
  note?: string,
  sortOrder?: number
): Promise<boolean> {
  const updateData: any = {
    province,
    city,
    visit_year: visitYear,
    visit_month: visitMonth,
    note: note || null,
  };
  if (sortOrder !== undefined) {
    updateData.sort_order = sortOrder;
  }

  const { error } = await supabase.from("footprints").update(updateData).eq("id", id);

  if (error) {
    console.error("更新 Foot Prints失败:", error);
    return false;
  }
  return true;
}

export async function deleteFootprint(id: string): Promise<boolean> {
  const { error } = await supabase.from("footprints").delete().eq("id", id);

  if (error) {
    console.error("删除 Foot Prints失败:", error);
    return false;
  }
  return true;
}

// 上移/下移 Foot Prints（与相邻位置交换 sort_order）
export async function moveFootprint(id: string, direction: "up" | "down"): Promise<boolean> {
  const spaceId = await getCurrentSpaceId();
  if (!spaceId) return false;

  // 先获取当前 Foot Prints
  const { data: current } = await supabase
    .from("footprints")
    .select("*")
    .eq("id", id)
    .single();

  if (!current) return false;
  const cur = current as Footprint;

  // 找同一年月的相邻 Foot Prints
  const { data: siblings } = await supabase
    .from("footprints")
    .select("*")
    .eq("space_id", spaceId)
    .eq("visit_year", cur.visit_year)
    .eq("visit_month", cur.visit_month)
    .order("sort_order", { ascending: true });

  if (!siblings || siblings.length <= 1) return false;

  const list = siblings as Footprint[];
  const curIndex = list.findIndex((f) => f.id === id);
  if (curIndex < 0) return false;

  let targetIndex: number;
  if (direction === "up") {
    targetIndex = curIndex - 1;
    if (targetIndex < 0) return false; // 已经是第一个
  } else {
    targetIndex = curIndex + 1;
    if (targetIndex >= list.length) return false; // 已经是最后一个
  }

  // 交换 sort_order
  const target = list[targetIndex];
  const tempSort = cur.sort_order;

  const { error: e1 } = await supabase
    .from("footprints")
    .update({ sort_order: target.sort_order })
    .eq("id", cur.id);
  if (e1) {
    console.error("移动 Foot Prints失败:", e1);
    return false;
  }

  const { error: e2 } = await supabase
    .from("footprints")
    .update({ sort_order: tempSort })
    .eq("id", target.id);
  if (e2) {
    console.error("移动 Foot Prints失败:", e2);
    return false;
  }

  return true;
}
