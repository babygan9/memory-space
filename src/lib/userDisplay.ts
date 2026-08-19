// 用户显示信息工具
// 根据用户名固定显示头像和昵称

interface UserDisplay {
  avatar: string;
  nickname: string;
  role: "owner" | "member";
}

const USER_MAP: Record<string, UserDisplay> = {
  jcqs: {
    avatar: "🐹",
    nickname: "jcqs",
    role: "owner",
  },
  meow2: {
    avatar: "🐰",
    nickname: "meow2",
    role: "member",
  },
};

/**
 * 根据用户名获取固定的显示信息
 * 如果不在白名单里，返回通用默认值
 */
export function getUserDisplay(username?: string | null): UserDisplay {
  if (!username) {
    return { avatar: "✨", nickname: "About us", role: "member" };
  }
  return (
    USER_MAP[username] || {
      avatar: "✨",
      nickname: username,
      role: "member",
    }
  );
}

/**
 * 从任意包含 username 的对象中获取显示信息
 * 优先使用 profile 里的自定义昵称和头像，没有的话回退到默认映射
 */
export function getDisplayFromProfile(profile?: {
  username?: string | null;
  nickname?: string | null;
  avatar_url?: string | null;
} | null): UserDisplay {
  const fallback = getUserDisplay(profile?.username);
  return {
    ...fallback,
    nickname: profile?.nickname || fallback.nickname,
    avatar: profile?.avatar_url || fallback.avatar,
  };
}
