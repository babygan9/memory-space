"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import AdminRoute from "@/components/layout/AdminRoute";
import {
  getMembers,
  getMoments,
  getArticles,
  getAllComments,
  getSpaceStats,
  getCountdowns,
  getFootprints,
  updateMoment,
  deleteMoment,
  updateArticle,
  deleteArticle,
  deleteComment,
  updateProfile,
  createCountdown,
  updateCountdown,
  deleteCountdown,
  createFootprint,
  updateFootprint,
  deleteFootprint,
  moveFootprint,
  formatDate,
  formatDateTime,
  type MemberWithProfile,
  type SpaceStats,
} from "@/lib/api";
import { getUserDisplay, getDisplayFromProfile } from "@/lib/userDisplay";
import { PROVINCE_NAMES, PROVINCE_NAME_MAP } from "@/components/footprints/chinaMapData";
import type { Moment, Article, Comment, Countdown, Footprint } from "@/types/database";

type TabKey = "stats" | "moments" | "articles" | "comments" | "members" | "countdowns" | "footprints";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "stats", label: "Stats", icon: "📊" },
  { key: "moments", label: "Post", icon: "📝" },
  { key: "articles", label: "Letters", icon: "📖" },
  { key: "comments", label: "Comments  ", icon: "💬" },
  { key: "members", label: "About us", icon: "👥" },
  { key: "countdowns", label: "Days", icon: "📅" },
  { key: "footprints", label: " Foot Prints", icon: "🗺️" },
];

// 预设常量（组件外定义，避免每次渲染重建）
const ICON_OPTIONS = ["🎉", "🎂", "❤️", "✨", "🌈", "🌸", "🎄", "🎃", "🎆", "🏖️", "🎓", "💍"];
const COLOR_OPTIONS = [
  { key: "pink", label: "粉色" },
  { key: "blue", label: "蓝色" },
  { key: "green", label: "绿色" },
  { key: "purple", label: "紫色" },
  { key: "orange", label: "橙色" },
  { key: "yellow", label: "黄色" },
];
const CD_ICON_OPTIONS = ICON_OPTIONS;
const CD_COLOR_OPTIONS = [
  { key: "pink", label: "粉色", bg: "bg-pink-500" },
  { key: "blue", label: "蓝色", bg: "bg-blue-500" },
  { key: "green", label: "绿色", bg: "bg-emerald-500" },
  { key: "purple", label: "紫色", bg: "bg-purple-500" },
  { key: "orange", label: "橙色", bg: "bg-orange-500" },
  { key: "yellow", label: "黄色", bg: "bg-amber-500" },
];
const AVATAR_EMOJIS = ["🐰", "🐹", "🐱", "🐶", "🐻", "🐼", "🦊", "🐨", "🐯", "🦁", "🐸", "🐵"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("stats");
  const [stats, setStats] = useState<SpaceStats | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingMember, setEditingMember] = useState<MemberWithProfile | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);
  const [showNewCountdown, setShowNewCountdown] = useState(false);
  const [cdTitle, setCdTitle] = useState("");
  const [cdDate, setCdDate] = useState("");
  const [cdIcon, setCdIcon] = useState("🎉");
  const [cdColor, setCdColor] = useState("pink");
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [editingFootprint, setEditingFootprint] = useState<Footprint | null>(null);
  const [showNewFootprint, setShowNewFootprint] = useState(false);
  const [fpProvince, setFpProvince] = useState(PROVINCE_NAMES[0]);
  const [fpCity, setFpCity] = useState("");
  const [fpYear, setFpYear] = useState(new Date().getFullYear());
  const [fpMonth, setFpMonth] = useState(new Date().getMonth() + 1);
  const [fpNote, setFpNote] = useState("");
  // 批量添加
  const [showBatchFootprint, setShowBatchFootprint] = useState(false);
  const [batchItems, setBatchItems] = useState<
    { province: string; city: string; year: number; month: number; note: string }[]
  >([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, m, mo, a, c, cd, fp] = await Promise.all([
      getSpaceStats(),
      getMembers(),
      getMoments(),
      getArticles(),
      getAllComments(),
      getCountdowns(),
      getFootprints(),
    ]);
    setStats(s);
    setMembers(m);
    setMoments(mo);
    setArticles(a);
    setComments(c);
    setCountdowns(cd);
    setFootprints(fp);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // 编辑Post
  const handleSaveMoment = useCallback(async () => {
    if (!editingMoment) return;
    const ok = await updateMoment(editingMoment.id, editingMoment.content);
    if (ok) {
      setEditingMoment(null);
      loadAll();
    } else {
      alert("保存失败");
    }
  }, [editingMoment, loadAll]);

  // 删除Post
  const handleDeleteMoment = useCallback(async (id: string) => {
    if (!confirm("确定要删除这条Post吗？关联的照片和Comments  也会一起删除。")) return;
    const ok = await deleteMoment(id);
    if (ok) loadAll();
    else alert("删除失败");
  }, [loadAll]);

  // 编辑Letters
  const handleSaveArticle = useCallback(async () => {
    if (!editingArticle) return;
    const ok = await updateArticle(
      editingArticle.id,
      editingArticle.title,
      editingArticle.content
    );
    if (ok) {
      setEditingArticle(null);
      loadAll();
    } else {
      alert("保存失败");
    }
  }, [editingArticle, loadAll]);

  // 删除Letters
  const handleDeleteArticle = useCallback(async (id: string) => {
    if (!confirm("确定要删除这篇Letter吗？关联的照片和Comments  也会一起删除。")) return;
    const ok = await deleteArticle(id);
    if (ok) loadAll();
    else alert("删除失败");
  }, [loadAll]);

  // 删除Comments  
  const handleDeleteComment = useCallback(async (id: string) => {
    if (!confirm("确定要删除这条Comments  吗？")) return;
    const ok = await deleteComment(id);
    if (ok) loadAll();
    else alert("删除失败");
  }, [loadAll]);

  // 开始编辑About us
  const handleStartEditMember = useCallback((member: MemberWithProfile) => {
    setEditingMember(member);
    setEditNickname(member.profiles?.nickname || "");
    setEditAvatar(member.profiles?.avatar_url || "");
  }, []);

  // 保存About us资料
  const handleSaveMember = useCallback(async () => {
    if (!editingMember || !editNickname.trim()) return;
    const ok = await updateProfile(
      editingMember.user_id,
      editNickname.trim(),
      editAvatar
    );
    if (ok) {
      setEditingMember(null);
      loadAll();
    } else {
      alert("保存失败");
    }
  }, [editingMember, editNickname, editAvatar, loadAll]);

  const resetCountdownForm = useCallback(() => {
    setCdTitle("");
    setCdDate("");
    setCdIcon("🎉");
    setCdColor("pink");
  }, []);

  const handleStartNewCountdown = useCallback(() => {
    resetCountdownForm();
    setShowNewCountdown(true);
    setEditingCountdown(null);
  }, [resetCountdownForm]);

  const handleStartEditCountdown = useCallback((cd: Countdown) => {
    setEditingCountdown(cd);
    setCdTitle(cd.title);
    setCdDate(cd.target_date);
    setCdIcon(cd.icon);
    setCdColor(cd.color);
    setShowNewCountdown(false);
  }, []);

  const handleSaveCountdown = useCallback(async () => {
    if (!cdTitle.trim() || !cdDate) return;

    let ok: boolean;
    if (editingCountdown) {
      ok = await updateCountdown(editingCountdown.id, cdTitle.trim(), cdDate, cdIcon, cdColor);
    } else {
      const res = await createCountdown(cdTitle.trim(), cdDate, cdIcon, cdColor);
      ok = !!res;
    }

    if (ok) {
      setEditingCountdown(null);
      setShowNewCountdown(false);
      resetCountdownForm();
      loadAll();
    } else {
      alert("保存失败");
    }
  }, [cdTitle, cdDate, cdIcon, cdColor, editingCountdown, resetCountdownForm, loadAll]);

  const handleDeleteCountdown = useCallback(async (id: string) => {
    if (!confirm("确定要删除这个Days吗？")) return;
    const ok = await deleteCountdown(id);
    if (ok) loadAll();
    else alert("删除失败");
  }, [loadAll]);

  const handleCancelCountdown = useCallback(() => {
    setEditingCountdown(null);
    setShowNewCountdown(false);
    resetCountdownForm();
  }, [resetCountdownForm]);

  // =====  Foot Prints管理 =====
  const resetFootprintForm = useCallback(() => {
    setFpProvince(PROVINCE_NAMES[0]);
    setFpCity("");
    setFpYear(new Date().getFullYear());
    setFpMonth(new Date().getMonth() + 1);
    setFpNote("");
  }, []);

  const handleStartNewFootprint = useCallback(() => {
    resetFootprintForm();
    setShowNewFootprint(true);
    setEditingFootprint(null);
  }, [resetFootprintForm]);

  const handleStartEditFootprint = useCallback((fp: Footprint) => {
    setEditingFootprint(fp);
    setFpProvince(PROVINCE_NAME_MAP[fp.province] || fp.province);
    setFpCity(fp.city);
    setFpYear(fp.visit_year);
    setFpMonth(fp.visit_month);
    setFpNote(fp.note || "");
    setShowNewFootprint(false);
  }, []);

  const handleSaveFootprint = useCallback(async () => {
    if (!fpCity.trim()) return;

    let ok: boolean;
    if (editingFootprint) {
      ok = await updateFootprint(
        editingFootprint.id,
        fpProvince,
        fpCity.trim(),
        fpYear,
        fpMonth,
        fpNote.trim() || undefined
      );
    } else {
      const res = await createFootprint(
        fpProvince,
        fpCity.trim(),
        fpYear,
        fpMonth,
        fpNote.trim() || undefined
      );
      ok = !!res;
    }

    if (ok) {
      setEditingFootprint(null);
      setShowNewFootprint(false);
      resetFootprintForm();
      loadAll();
    } else {
      alert("保存失败");
    }
  }, [fpProvince, fpCity, fpYear, fpMonth, fpNote, editingFootprint, resetFootprintForm, loadAll]);

  const handleDeleteFootprint = useCallback(async (id: string) => {
    if (!confirm("确定要删除这条 Foot Prints吗？")) return;
    const ok = await deleteFootprint(id);
    if (ok) loadAll();
    else alert("删除失败");
  }, [loadAll]);

  const handleMoveFootprint = useCallback(async (id: string, direction: "up" | "down") => {
    const ok = await moveFootprint(id, direction);
    if (ok) loadAll();
  }, [loadAll]);

  const handleCancelFootprint = useCallback(() => {
    setEditingFootprint(null);
    setShowNewFootprint(false);
    resetFootprintForm();
  }, [resetFootprintForm]);

  // ===== 批量添加 Foot Prints =====
  const handleStartBatchFootprint = useCallback(() => {
    setBatchItems([
      { province: PROVINCE_NAMES[0], city: "", year: new Date().getFullYear(), month: new Date().getMonth() + 1, note: "" },
    ]);
    setShowBatchFootprint(true);
    setShowNewFootprint(false);
    setEditingFootprint(null);
  }, []);

  const updateBatchItem = useCallback((index: number, field: string, value: any) => {
    setBatchItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addBatchItem = useCallback(() => {
    setBatchItems((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          province: last?.province || PROVINCE_NAMES[0],
          city: "",
          year: last?.year || new Date().getFullYear(),
          month: last?.month || new Date().getMonth() + 1,
          note: "",
        },
      ];
    });
  }, []);

  const removeBatchItem = useCallback((index: number) => {
    setBatchItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const handleSaveBatchFootprint = useCallback(async () => {
    const validItems = batchItems.filter((item) => item.city.trim());
    if (validItems.length === 0) {
      alert("请至少填写一条有效的 Foot Prints（城市不能为空）");
      return;
    }
    const results = await Promise.all(
      validItems.map((item) =>
        createFootprint(
          item.province,
          item.city.trim(),
          item.year,
          item.month,
          item.note.trim() || undefined
        )
      )
    );
    const successCount = results.filter(Boolean).length;
    if (successCount > 0) {
      setShowBatchFootprint(false);
      setBatchItems([]);
      loadAll();
      alert(`成功添加 ${successCount} 条 Foot Prints`);
    } else {
      alert("保存失败");
    }
  }, [batchItems, loadAll]);

  const handleCancelBatchFootprint = useCallback(() => {
    setShowBatchFootprint(false);
    setBatchItems([]);
  }, []);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-cream-100">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* 标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-pixel-brown pixel-text flex items-center gap-2">
              ⚙️  Manage
            </h1>
          </div>

          {/* Tab 栏 */}
          <div className="glass-card p-2 mb-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-2xl pixel-text text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-pixel-yellow/50 text-pixel-brown"
                    : "text-pixel-brown/60 hover:text-pixel-brown hover:bg-pixel-brown/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div>
            {activeTab === "stats" && (
              <StatsTab stats={stats} loading={loading} />
            )}
            {activeTab === "moments" && (
              <MomentsTab
                moments={moments}
                loading={loading}
                editingMoment={editingMoment}
                setEditingMoment={setEditingMoment}
                onSaveMoment={handleSaveMoment}
                onDeleteMoment={handleDeleteMoment}
              />
            )}
            {activeTab === "articles" && (
              <ArticlesTab
                articles={articles}
                loading={loading}
                editingArticle={editingArticle}
                setEditingArticle={setEditingArticle}
                onSaveArticle={handleSaveArticle}
                onDeleteArticle={handleDeleteArticle}
              />
            )}
            {activeTab === "comments" && (
              <CommentsTab
                comments={comments}
                loading={loading}
                onDeleteComment={handleDeleteComment}
              />
            )}
            {activeTab === "members" && (
              <MembersTab
                members={members}
                loading={loading}
                editingMember={editingMember}
                editNickname={editNickname}
                editAvatar={editAvatar}
                setEditNickname={setEditNickname}
                setEditAvatar={setEditAvatar}
                onStartEdit={handleStartEditMember}
                onSave={handleSaveMember}
                onCancel={() => setEditingMember(null)}
              />
            )}
            {activeTab === "countdowns" && (
              <CountdownsTab
                countdowns={countdowns}
                loading={loading}
                editingCountdown={editingCountdown}
                showNewCountdown={showNewCountdown}
                cdTitle={cdTitle}
                cdDate={cdDate}
                cdIcon={cdIcon}
                cdColor={cdColor}
                setCdTitle={setCdTitle}
                setCdDate={setCdDate}
                setCdIcon={setCdIcon}
                setCdColor={setCdColor}
                onStartNew={handleStartNewCountdown}
                onStartEdit={handleStartEditCountdown}
                onSave={handleSaveCountdown}
                onDelete={handleDeleteCountdown}
                onCancel={handleCancelCountdown}
              />
            )}
            {activeTab === "footprints" && (
              <FootprintsTab
                footprints={footprints}
                loading={loading}
                editingFootprint={editingFootprint}
                showNewFootprint={showNewFootprint}
                showBatchFootprint={showBatchFootprint}
                batchItems={batchItems}
                fpProvince={fpProvince}
                fpCity={fpCity}
                fpYear={fpYear}
                fpMonth={fpMonth}
                fpNote={fpNote}
                setFpProvince={setFpProvince}
                setFpCity={setFpCity}
                setFpYear={setFpYear}
                setFpMonth={setFpMonth}
                setFpNote={setFpNote}
                onStartNew={handleStartNewFootprint}
                onStartBatch={handleStartBatchFootprint}
                onStartEdit={handleStartEditFootprint}
                onSave={handleSaveFootprint}
                onSaveBatch={handleSaveBatchFootprint}
                onDelete={handleDeleteFootprint}
                onMove={handleMoveFootprint}
                onCancel={handleCancelFootprint}
                onCancelBatch={handleCancelBatchFootprint}
                onUpdateBatchItem={updateBatchItem}
                onAddBatchItem={addBatchItem}
                onRemoveBatchItem={removeBatchItem}
              />
            )}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}

// ========== Stats Tab ==========
function StatsTab({
  stats,
  loading,
}: {
  stats: SpaceStats | null;
  loading: boolean;
}) {
  const statCards = stats
    ? [
        { label: "About us", value: stats.memberCount, icon: "👥" },
        { label: "Post", value: stats.momentCount, icon: "📝" },
        { label: "Letters", value: stats.articleCount, icon: "📖" },
        { label: "Photo", value: stats.photoCount, icon: "🖼️" },
        { label: "Comments  ", value: stats.commentCount, icon: "💬" },
      ]
    : [];

  return (
    <section>
      <h2 className="text-lg font-bold text-pixel-brown pixel-text mb-4">
        📊 Stats
      </h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="h-6 w-10 skeleton-shimmer rounded mb-2" />
              <div className="h-8 w-16 skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{card.icon}</div>
              <p className="text-xs text-pixel-brown/50 pixel-text mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-pixel-brown pixel-text">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ========== Post Tab ==========
function MomentsTab({
  moments,
  loading,
  editingMoment,
  setEditingMoment,
  onSaveMoment,
  onDeleteMoment,
}: {
  moments: Moment[];
  loading: boolean;
  editingMoment: Moment | null;
  setEditingMoment: (m: Moment | null) => void;
  onSaveMoment: () => void;
  onDeleteMoment: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 space-y-2">
            <div className="h-4 w-32 skeleton-shimmer rounded" />
            <div className="h-3 w-full skeleton-shimmer rounded" />
            <div className="h-3 w-2/3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">📝</div>
        <p className="text-pixel-brown/50 pixel-text">还没有Post</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moments.map((moment) => {
        const display = getDisplayFromProfile(moment.profiles);
        const isEditing = editingMoment?.id === moment.id;

        return (
          <div key={moment.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{display.avatar}</span>
                <span className="font-bold text-pixel-brown pixel-text text-sm">
                  {display.nickname}
                </span>
                <span className="text-xs text-pixel-brown/40 pixel-text">
                  {formatDateTime(moment.created_at)}
                </span>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingMoment(moment)}
                      className="text-xs px-3 py-1 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDeleteMoment(moment.id)}
                      className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 pixel-text hover:bg-red-200"
                    >
                      删除
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onSaveMoment}
                      className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingMoment(null)}
                      className="text-xs px-3 py-1 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editingMoment.content}
                onChange={(e) =>
                  setEditingMoment({ ...editingMoment, content: e.target.value })
                }
                className="w-full h-32 glass-input pixel-text resize-none"
              />
            ) : (
              <p className="text-pixel-brown/80 pixel-text whitespace-pre-wrap text-sm leading-relaxed">
                {moment.content}
              </p>
            )}

            {moment.photos && moment.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {moment.photos.slice(0, 4).map((p) => (
                  <div key={p.id} className="aspect-square rounded-xl overflow-hidden">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {moment.photos.length > 4 && (
                  <div className="aspect-square rounded-xl bg-pixel-brown/10 flex items-center justify-center text-pixel-brown/50 pixel-text text-xs">
                    +{moment.photos.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== Letters Tab ==========
function ArticlesTab({
  articles,
  loading,
  editingArticle,
  setEditingArticle,
  onSaveArticle,
  onDeleteArticle,
}: {
  articles: Article[];
  loading: boolean;
  editingArticle: Article | null;
  setEditingArticle: (a: Article | null) => void;
  onSaveArticle: () => void;
  onDeleteArticle: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 space-y-2">
            <div className="h-5 w-1/2 skeleton-shimmer rounded" />
            <div className="h-3 w-full skeleton-shimmer rounded" />
            <div className="h-3 w-2/3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">📖</div>
        <p className="text-pixel-brown/50 pixel-text">还没有Letter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => {
        const display = getDisplayFromProfile(article.profiles);
        const isEditing = editingArticle?.id === article.id;

        return (
          <div key={article.id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{display.avatar}</span>
                <span className="font-bold text-pixel-brown pixel-text text-sm">
                  {display.nickname}
                </span>
                <span className="text-xs text-pixel-brown/40 pixel-text">
                  {formatDateTime(article.created_at)}
                </span>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="text-xs px-3 py-1 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDeleteArticle(article.id)}
                      className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 pixel-text hover:bg-red-200"
                    >
                      删除
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onSaveArticle}
                      className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingArticle(null)}
                      className="text-xs px-3 py-1 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full h-10 glass-input pixel-text font-bold"
                />
                <textarea
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  className="w-full h-48 glass-input pixel-text resize-none"
                />
              </div>
            ) : (
              <>
                <h3 className="font-bold text-pixel-brown pixel-text text-lg mb-2">
                  {article.title}
                </h3>
                <p className="text-pixel-brown/80 pixel-text whitespace-pre-wrap text-sm leading-relaxed">
                  {article.content.length > 200
                    ? article.content.slice(0, 200) + "..."
                    : article.content}
                </p>
              </>
            )}

            {article.photos && article.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {article.photos.slice(0, 4).map((p) => (
                  <div key={p.id} className="aspect-square rounded-xl overflow-hidden">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {article.photos.length > 4 && (
                  <div className="aspect-square rounded-xl bg-pixel-brown/10 flex items-center justify-center text-pixel-brown/50 pixel-text text-xs">
                    +{article.photos.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== Comments   Tab ==========
function CommentsTab({
  comments,
  loading,
  onDeleteComment,
}: {
  comments: Comment[];
  loading: boolean;
  onDeleteComment: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 space-y-2">
            <div className="h-4 w-32 skeleton-shimmer rounded" />
            <div className="h-3 w-full skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-pixel-brown/50 pixel-text">还没有Comment  </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const display = getDisplayFromProfile(comment.profiles);
        return (
          <div key={comment.id} className="glass-card p-4 flex gap-3">
            <div className="text-lg flex-shrink-0">{display.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-pixel-brown pixel-text text-sm">
                    {display.nickname}
                  </span>
                  <span className="text-xs text-pixel-brown/40 pixel-text truncate">
                    {comment.target_type === "moment" ? "Post" : "Letters"} ·{" "}
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 pixel-text hover:bg-red-200 flex-shrink-0"
                >
                  删除
                </button>
              </div>
              <p className="text-pixel-brown/80 pixel-text text-sm leading-relaxed break-words">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== About us Tab ==========
function MembersTab({
  members,
  loading,
  editingMember,
  editNickname,
  editAvatar,
  setEditNickname,
  setEditAvatar,
  onStartEdit,
  onSave,
  onCancel,
}: {
  members: MemberWithProfile[];
  loading: boolean;
  editingMember: MemberWithProfile | null;
  editNickname: string;
  editAvatar: string;
  setEditNickname: (v: string) => void;
  setEditAvatar: (v: string) => void;
  onStartEdit: (m: MemberWithProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 skeleton-shimmer rounded" />
              <div className="h-3 w-32 skeleton-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const display = getDisplayFromProfile(member.profiles);
        const isEditing = editingMember?.id === member.id;

        // 优先用数据库里的 avatar_url 和 nickname，没有就用默认映射
        const currentAvatar = display.avatar;
        const currentNickname = display.nickname;

        return (
          <div key={member.id} className="glass-card p-4">
            {isEditing ? (
              // 编辑模式
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-pixel-pink/30 flex items-center justify-center text-2xl flex-shrink-0">
                    {editAvatar || "✨"}
                  </div>
                  <div className="flex-1">
                    <input
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="昵称"
                      className="w-full h-10 glass-input pixel-text font-bold"
                    />
                  </div>
                </div>

                {/* 头像选择器 */}
                <div>
                  <p className="text-xs text-pixel-brown/60 pixel-text mb-2">
                    选择头像：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setEditAvatar(emoji)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                          editAvatar === emoji
                            ? "bg-pixel-yellow/50 ring-2 ring-pixel-yellow scale-110"
                            : "bg-pixel-brown/5 hover:bg-pixel-brown/10"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onCancel}
                    className="text-xs px-4 py-2 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
                  >
                    取消
                  </button>
                  <button
                    onClick={onSave}
                    disabled={!editNickname.trim()}
                    className="text-xs px-4 py-2 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              // 浏览模式
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pixel-pink/30 flex items-center justify-center text-xl flex-shrink-0">
                  {currentAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-pixel-brown pixel-text">
                      {currentNickname}
                    </p>
                    {member.role === "owner" && (
                      <span className="px-2 py-0.5 bg-pixel-pink/30 text-pixel-pink text-xs rounded-full pixel-text">
                        管理员
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pixel-brown/50 pixel-text truncate">
                    @{member.profiles?.username} · 加入于 {formatDate(member.joined_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">
                    {member.role === "owner" ? "👑" : "✨"}
                  </div>
                  <button
                    onClick={() => onStartEdit(member)}
                    className="text-xs px-3 py-1 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50"
                  >
                    编辑
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== Days Tab ==========
function CountdownsTab({
  countdowns,
  loading,
  editingCountdown,
  showNewCountdown,
  cdTitle,
  cdDate,
  cdIcon,
  cdColor,
  setCdTitle,
  setCdDate,
  setCdIcon,
  setCdColor,
  onStartNew,
  onStartEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  countdowns: Countdown[];
  loading: boolean;
  editingCountdown: Countdown | null;
  showNewCountdown: boolean;
  cdTitle: string;
  cdDate: string;
  cdIcon: string;
  cdColor: string;
  setCdTitle: (v: string) => void;
  setCdDate: (v: string) => void;
  setCdIcon: (v: string) => void;
  setCdColor: (v: string) => void;
  onStartNew: () => void;
  onStartEdit: (cd: Countdown) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}) {
  const isEditing = editingCountdown || showNewCountdown;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 h-20 skeleton-shimmer rounded-[28px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 新增按钮 */}
      {!isEditing && (
        <button
          onClick={onStartNew}
          className="w-full glass-card p-4 rounded-[28px] border-2 border-dashed border-pixel-brown/20 hover:border-pixel-brown/40 text-pixel-brown/50 hover:text-pixel-brown/70 pixel-text transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> 添加Days
        </button>
      )}

      {/* 新增/编辑表单 */}
      {isEditing && (
        <div className="glass-card p-5 rounded-[28px] border-2 border-pixel-yellow/30">
          <p className="font-bold text-pixel-brown pixel-text mb-4">
            {editingCountdown ? "编辑Days" : "新增Days"}
          </p>

          <div className="space-y-4">
            {/* 标题 */}
            <input
              value={cdTitle}
              onChange={(e) => setCdTitle(e.target.value)}
              placeholder="Days标题，如：纪念日、生日..."
              className="w-full h-10 glass-input pixel-text font-bold"
            />

            {/* 日期 */}
            <input
              type="date"
              value={cdDate}
              onChange={(e) => setCdDate(e.target.value)}
              className="w-full h-10 glass-input pixel-text font-bold"
            />

            {/* 图标选择 */}
            <div>
              <p className="text-xs text-pixel-brown/60 pixel-text mb-2">选择图标：</p>
              <div className="flex flex-wrap gap-2">
                {CD_ICON_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setCdIcon(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                      cdIcon === emoji
                        ? "bg-pixel-yellow/50 ring-2 ring-pixel-yellow scale-110"
                        : "bg-pixel-brown/5 hover:bg-pixel-brown/10"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择 */}
            <div>
              <p className="text-xs text-pixel-brown/60 pixel-text mb-2">选择颜色：</p>
              <div className="flex flex-wrap gap-2">
                {CD_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCdColor(c.key)}
                    className={`px-3 py-1.5 rounded-full text-xs pixel-text transition-all flex items-center gap-1.5 ${
                      cdColor === c.key
                        ? "ring-2 ring-pixel-brown/50 scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onCancel}
                className="text-xs px-4 py-2 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
              >
                取消
              </button>
              <button
                onClick={onSave}
                disabled={!cdTitle.trim() || !cdDate}
                className="text-xs px-4 py-2 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Days列表 */}
      {countdowns.map((cd) => {
        const isEditingThis = editingCountdown?.id === cd.id;
        if (isEditingThis) return null;

        const colorPreview = CD_COLOR_OPTIONS.find((c) => c.key === cd.color)?.bg || "bg-pink-500";

        return (
          <div key={cd.id} className="glass-card p-4 rounded-[28px] flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${colorPreview} flex items-center justify-center text-2xl flex-shrink-0`}>
              {cd.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-pixel-brown pixel-text truncate">{cd.title}</p>
              <p className="text-xs text-pixel-brown/50 pixel-text">{cd.target_date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartEdit(cd)}
                className="text-xs px-3 py-1 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50"
              >
                编辑
              </button>
              <button
                onClick={() => onDelete(cd.id)}
                className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 pixel-text hover:bg-red-200"
              >
                删除
              </button>
            </div>
          </div>
        );
      })}

      {countdowns.length === 0 && !isEditing && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-pixel-brown/50 pixel-text">还没有Days</p>
          <p className="text-pixel-brown/30 pixel-text text-xs mt-1">点击上方按钮添加第一个吧</p>
        </div>
      )}
    </div>
  );
}

// ========== 省份搜索输入框（带自动匹配） ==========
function ProvinceSearch({
  value,
  onChange,
  placeholder = "输入省份名搜索...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matched = PROVINCE_NAMES.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onClick={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full h-10 glass-input pixel-text font-bold"
      />
      {showDropdown && matched.length > 0 && (
        <div
          className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-2xl shadow-lg"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {matched.map((name) => (
            <button
              key={name}
              onClick={() => {
                setQuery(name);
                onChange(name);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 pixel-text text-sm hover:bg-pixel-yellow/30 transition-colors ${
                name === value ? "bg-pixel-yellow/40 font-bold" : ""
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== 数字搜索输入框（年份/月份用） ==========
function NumberSearch({
  value,
  onChange,
  options,
  placeholder = "输入或选择...",
  suffix = "",
}: {
  value: number;
  onChange: (v: number) => void;
  options: number[];
  placeholder?: string;
  suffix?: string;
}) {
  const [query, setQuery] = useState(String(value));
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(String(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        // 失焦时校验并回写合法值
        const num = parseInt(query, 10);
        if (!isNaN(num) && options.includes(num)) {
          onChange(num);
        } else {
          setQuery(String(value));
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, options, onChange, value]);

  const matched = options.filter((n) => String(n).includes(query.trim()));

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, "");
          setQuery(v);
          setShowDropdown(true);
          const num = parseInt(v, 10);
          if (!isNaN(num) && options.includes(num)) {
            onChange(num);
          }
        }}
        onFocus={() => setShowDropdown(true)}
        onClick={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full h-10 glass-input pixel-text font-bold"
      />
      {showDropdown && matched.length > 0 && (
        <div
          className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-2xl shadow-lg"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {matched.map((n) => (
            <button
              key={n}
              onClick={() => {
                setQuery(String(n));
                onChange(n);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 pixel-text text-sm hover:bg-pixel-yellow/30 transition-colors ${
                n === value ? "bg-pixel-yellow/40 font-bold" : ""
              }`}
            >
              {n}
              {suffix}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========  Foot Prints Tab ==========
function FootprintsTab({
  footprints,
  loading,
  editingFootprint,
  showNewFootprint,
  showBatchFootprint,
  batchItems,
  fpProvince,
  fpCity,
  fpYear,
  fpMonth,
  fpNote,
  setFpProvince,
  setFpCity,
  setFpYear,
  setFpMonth,
  setFpNote,
  onStartNew,
  onStartBatch,
  onStartEdit,
  onSave,
  onSaveBatch,
  onDelete,
  onMove,
  onCancel,
  onCancelBatch,
  onUpdateBatchItem,
  onAddBatchItem,
  onRemoveBatchItem,
}: {
  footprints: Footprint[];
  loading: boolean;
  editingFootprint: Footprint | null;
  showNewFootprint: boolean;
  showBatchFootprint: boolean;
  batchItems: { province: string; city: string; year: number; month: number; note: string }[];
  fpProvince: string;
  fpCity: string;
  fpYear: number;
  fpMonth: number;
  fpNote: string;
  setFpProvince: (v: string) => void;
  setFpCity: (v: string) => void;
  setFpYear: (v: number) => void;
  setFpMonth: (v: number) => void;
  setFpNote: (v: string) => void;
  onStartNew: () => void;
  onStartBatch: () => void;
  onStartEdit: (fp: Footprint) => void;
  onSave: () => void;
  onSaveBatch: () => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onCancel: () => void;
  onCancelBatch: () => void;
  onUpdateBatchItem: (index: number, field: string, value: any) => void;
  onAddBatchItem: () => void;
  onRemoveBatchItem: (index: number) => void;
}) {
  const isEditing = editingFootprint || showNewFootprint;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 h-16 skeleton-shimmer rounded-[28px]" />
        ))}
      </div>
    );
  }

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 计算每条 Foot Prints在同年月中的位置（用于判断能否上移/下移）
  const positionInfo = useMemo(() => {
    const map: Record<string, { total: number; index: number }> = {};
    const groups: Record<string, Footprint[]> = {};
    footprints.forEach((fp) => {
      const key = `${fp.visit_year}-${fp.visit_month}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(fp);
    });
    Object.keys(groups).forEach((key) => {
      groups[key].forEach((fp, idx) => {
        map[fp.id] = { total: groups[key].length, index: idx };
      });
    });
    return map;
  }, [footprints]);

  return (
    <div className="space-y-3">
      {/* 新增按钮组 */}
      {!isEditing && !showBatchFootprint && (
        <div className="flex gap-2">
          <button
            onClick={onStartNew}
            className="flex-1 glass-card p-4 rounded-[28px] border-2 border-dashed border-pixel-brown/20 hover:border-pixel-brown/40 text-pixel-brown/50 hover:text-pixel-brown/70 pixel-text transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> 添加 Foot Prints
          </button>
          <button
            onClick={onStartBatch}
            className="flex-1 glass-card p-4 rounded-[28px] border-2 border-dashed border-pixel-yellow/40 hover:border-pixel-yellow/60 text-pixel-brown/50 hover:text-pixel-brown/70 pixel-text transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">++</span> 批量添加
          </button>
        </div>
      )}

      {/* 新增/编辑表单（单条） */}
      {isEditing && (
        <div className="glass-card p-5 rounded-[28px] border-2 border-pixel-yellow/30">
          <p className="font-bold text-pixel-brown pixel-text mb-4">
            {editingFootprint ? "编辑 Foot Prints" : "新增 Foot Prints"}
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* 省份（搜索输入框） */}
              <div>
                <label className="text-xs text-pixel-brown/60 pixel-text mb-1 block">省份</label>
                <ProvinceSearch value={fpProvince} onChange={setFpProvince} />
              </div>

              {/* 城市 */}
              <div>
                <label className="text-xs text-pixel-brown/60 pixel-text mb-1 block">城市</label>
                <input
                  value={fpCity}
                  onChange={(e) => setFpCity(e.target.value)}
                  placeholder="如：北京、上海..."
                  className="w-full h-10 glass-input pixel-text font-bold"
                />
              </div>
            </div>

            {/* 年月 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-pixel-brown/60 pixel-text mb-1 block">年份</label>
                <NumberSearch
                  value={fpYear}
                  onChange={setFpYear}
                  options={years}
                  placeholder="输入年份..."
                />
              </div>
              <div>
                <label className="text-xs text-pixel-brown/60 pixel-text mb-1 block">月份</label>
                <NumberSearch
                  value={fpMonth}
                  onChange={setFpMonth}
                  options={months}
                  placeholder="输入月份..."
                  suffix="月"
                />
              </div>
            </div>

            {/* 备注 */}
            <div>
              <label className="text-xs text-pixel-brown/60 pixel-text mb-1 block">备注（可选）</label>
              <input
                value={fpNote}
                onChange={(e) => setFpNote(e.target.value)}
                placeholder="简短备注..."
                className="w-full h-10 glass-input pixel-text"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onCancel}
                className="text-xs px-4 py-2 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
              >
                取消
              </button>
              <button
                onClick={onSave}
                disabled={!fpCity.trim()}
                className="text-xs px-4 py-2 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量添加表单 */}
      {showBatchFootprint && (
        <div className="glass-card p-5 rounded-[28px] border-2 border-pixel-yellow/50">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-pixel-brown pixel-text">
              批量添加 Foot Prints（{batchItems.length} 条）
            </p>
            <button
              onClick={onAddBatchItem}
              className="text-xs px-3 py-1.5 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50 font-bold"
            >
              + 再加一条
            </button>
          </div>

          <div className="space-y-3">
            {batchItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs pixel-text font-bold text-pixel-brown/60">
                    #{index + 1}
                  </span>
                  {batchItems.length > 1 && (
                    <button
                      onClick={() => onRemoveBatchItem(index)}
                      className="text-xs pixel-text text-red-500 hover:text-red-700 ml-auto"
                    >
                      删除此条
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <ProvinceSearch
                    value={item.province}
                    onChange={(v) => onUpdateBatchItem(index, "province", v)}
                  />
                  <input
                    value={item.city}
                    onChange={(e) => onUpdateBatchItem(index, "city", e.target.value)}
                    placeholder="城市"
                    className="w-full h-10 glass-input pixel-text font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <NumberSearch
                    value={item.year}
                    onChange={(v) => onUpdateBatchItem(index, "year", v)}
                    options={years}
                    placeholder="年"
                  />
                  <NumberSearch
                    value={item.month}
                    onChange={(v) => onUpdateBatchItem(index, "month", v)}
                    options={months}
                    placeholder="月"
                    suffix="月"
                  />
                  <input
                    value={item.note}
                    onChange={(e) => onUpdateBatchItem(index, "note", e.target.value)}
                    placeholder="备注（可选）"
                    className="w-full h-10 glass-input pixel-text text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onCancelBatch}
              className="text-xs px-4 py-2 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20"
            >
              取消
            </button>
            <button
              onClick={onSaveBatch}
              disabled={!batchItems.some((i) => i.city.trim())}
              className="text-xs px-4 py-2 rounded-full bg-green-100 text-green-700 pixel-text hover:bg-green-200 font-bold disabled:opacity-50"
            >
              保存全部
            </button>
          </div>
        </div>
      )}

      {/*  Foot Prints列表 */}
      {!showBatchFootprint &&
        footprints.map((fp) => {
          const isEditingThis = editingFootprint?.id === fp.id;
          if (isEditingThis) return null;

          return (
            <div
              key={fp.id}
              className="glass-card p-4 rounded-[28px] flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-pixel-yellow/30 flex items-center justify-center text-2xl flex-shrink-0">
                📍
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-pixel-brown pixel-text">
                  {fp.province} · {fp.city}
                </p>
                <p className="text-xs text-pixel-brown/50 pixel-text">
                  {fp.visit_year}.{String(fp.visit_month).padStart(2, "0")}
                  {fp.note && <span className="ml-2">· {fp.note}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMove(fp.id, "up")}
                  disabled={positionInfo[fp.id]?.index === 0}
                  className="text-xs w-8 h-8 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  title="上移"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMove(fp.id, "down")}
                  disabled={positionInfo[fp.id]?.index === positionInfo[fp.id]?.total - 1}
                  className="text-xs w-8 h-8 rounded-full bg-pixel-brown/10 text-pixel-brown pixel-text hover:bg-pixel-brown/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  title="下移"
                >
                  ↓
                </button>
                <button
                  onClick={() => onStartEdit(fp)}
                  className="text-xs px-3 py-1 rounded-full bg-pixel-yellow/30 text-pixel-brown pixel-text hover:bg-pixel-yellow/50"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(fp.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 pixel-text hover:bg-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}

      {footprints.length === 0 && !isEditing && !showBatchFootprint && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-pixel-brown/50 pixel-text">还没有 Foot Prints</p>
          <p className="text-pixel-brown/30 pixel-text text-xs mt-1">点击上方按钮添加第一条吧</p>
        </div>
      )}
    </div>
  );
}
