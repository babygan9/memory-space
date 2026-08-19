-- ========================================
-- Playground - 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ========================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. 数据表结构
-- ========================================

-- Spaces - 空间表
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cover_image TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles - 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships - About us关系表
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Moments - Post表
CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles - Letters表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Photos - 照片表
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('moment', 'article')),
  owner_id UUID NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments - Comments  表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('moment', 'article')),
  target_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Edit History - 编辑历史表
CREATE TABLE IF NOT EXISTS edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('moment', 'article')),
  target_id UUID NOT NULL,
  editor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Countdowns - Days表
CREATE TABLE IF NOT EXISTS countdowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎉',
  color TEXT NOT NULL DEFAULT 'pink',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Footprints -  Foot Prints表
CREATE TABLE IF NOT EXISTS footprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  visit_year INTEGER NOT NULL,
  visit_month INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- 3. 索引
-- ========================================

CREATE INDEX IF NOT EXISTS idx_moments_space_id ON moments(space_id);
CREATE INDEX IF NOT EXISTS idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_space_id ON articles(space_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_owner ON photos(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_edit_history_target ON edit_history(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_edited_at ON edit_history(edited_at ASC);
CREATE INDEX IF NOT EXISTS idx_countdowns_space_id ON countdowns(space_id);
CREATE INDEX IF NOT EXISTS idx_countdowns_sort_order ON countdowns(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_footprints_space_id ON footprints(space_id);
CREATE INDEX IF NOT EXISTS idx_footprints_province ON footprints(province);
CREATE INDEX IF NOT EXISTS idx_footprints_sort_order ON footprints(visit_year DESC, visit_month DESC, sort_order ASC);

-- ========================================
-- 4. 行级安全策略 (RLS)
-- ========================================

-- 启用 RLS
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE footprints ENABLE ROW LEVEL SECURITY;

-- 策略函数：检查用户是否是空间About us
CREATE OR REPLACE FUNCTION is_space_member(check_space_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE space_id = check_space_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 策略函数：检查两个用户是否属于同一个空间
CREATE OR REPLACE FUNCTION is_same_space_member(other_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships m1
    INNER JOIN memberships m2 ON m1.space_id = m2.space_id
    WHERE m1.user_id = auth.uid()
    AND m2.user_id = other_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 策略函数：检查当前用户是否是某个空间的 owner
CREATE OR REPLACE FUNCTION is_space_owner_of_content(content_space_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE space_id = content_space_id
    AND user_id = auth.uid()
    AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 策略函数：检查当前用户是否是某个用户的同空间 owner（用于更新其他About us资料）
CREATE OR REPLACE FUNCTION is_owner_of_same_space(other_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships m1
    INNER JOIN memberships m2 ON m1.space_id = m2.space_id
    WHERE m1.user_id = auth.uid()
    AND m1.role = 'owner'
    AND m2.user_id = other_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles 策略
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of same space members"
  ON profiles FOR SELECT USING (is_same_space_member(id));

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id OR is_owner_of_same_space(id));

-- Spaces 策略
CREATE POLICY "Members can view space"
  ON spaces FOR SELECT USING (is_space_member(id));

CREATE POLICY "Owners can create space"
  ON spaces FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Memberships 策略
CREATE POLICY "Members can view memberships"
  ON memberships FOR SELECT USING (is_space_member(space_id));

-- Moments 策略
CREATE POLICY "Members can view moments"
  ON moments FOR SELECT USING (is_space_member(space_id));

CREATE POLICY "Members can create moments"
  ON moments FOR INSERT WITH CHECK (
    is_space_member(space_id)
    AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update their moments"
  ON moments FOR UPDATE USING (auth.uid() = author_id OR is_space_owner_of_content(space_id));

CREATE POLICY "Authors can delete their moments"
  ON moments FOR DELETE USING (auth.uid() = author_id OR is_space_owner_of_content(space_id));

-- Articles 策略
CREATE POLICY "Members can view articles"
  ON articles FOR SELECT USING (is_space_member(space_id));

CREATE POLICY "Members can create articles"
  ON articles FOR INSERT WITH CHECK (
    is_space_member(space_id)
    AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update their articles"
  ON articles FOR UPDATE USING (auth.uid() = author_id OR is_space_owner_of_content(space_id));

CREATE POLICY "Authors can delete their articles"
  ON articles FOR DELETE USING (auth.uid() = author_id OR is_space_owner_of_content(space_id));

-- Photos 策略
CREATE POLICY "Members can view photos"
  ON photos FOR SELECT USING (
    (owner_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = owner_id AND is_space_member(space_id)
    ))
    OR
    (owner_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = owner_id AND is_space_member(space_id)
    ))
  );

CREATE POLICY "Members can upload photos"
  ON photos FOR INSERT WITH CHECK (
    (owner_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = owner_id AND author_id = auth.uid()
    ))
    OR
    (owner_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = owner_id AND author_id = auth.uid()
    ))
  );

CREATE POLICY "Owners can delete their photos"
  ON photos FOR DELETE USING (
    (owner_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = owner_id AND (author_id = auth.uid() OR is_space_owner_of_content(space_id))
    ))
    OR
    (owner_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = owner_id AND (author_id = auth.uid() OR is_space_owner_of_content(space_id))
    ))
  );

-- Comments 策略
CREATE POLICY "Members can view comments"
  ON comments FOR SELECT USING (
    (target_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = target_id AND is_space_member(space_id)
    ))
    OR
    (target_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = target_id AND is_space_member(space_id)
    ))
  );

CREATE POLICY "Members can create comments"
  ON comments FOR INSERT WITH CHECK (
    auth.uid() = author_id
  );

CREATE POLICY "Authors can update their comments"
  ON comments FOR UPDATE USING (
    auth.uid() = author_id
    OR (target_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = target_id AND is_space_owner_of_content(space_id)
    ))
    OR (target_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = target_id AND is_space_owner_of_content(space_id)
    ))
  );

CREATE POLICY "Authors can delete their comments"
  ON comments FOR DELETE USING (
    auth.uid() = author_id
    OR (target_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = target_id AND is_space_owner_of_content(space_id)
    ))
    OR (target_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = target_id AND is_space_owner_of_content(space_id)
    ))
  );

-- Edit History 策略
CREATE POLICY "Members can view edit history"
  ON edit_history FOR SELECT USING (
    (target_type = 'moment' AND EXISTS (
      SELECT 1 FROM moments WHERE id = target_id AND is_space_member(space_id)
    ))
    OR
    (target_type = 'article' AND EXISTS (
      SELECT 1 FROM articles WHERE id = target_id AND is_space_member(space_id)
    ))
  );

CREATE POLICY "Members can create edit history"
  ON edit_history FOR INSERT WITH CHECK (
    auth.uid() = editor_id
  );

-- Countdowns 策略
CREATE POLICY "Members can view countdowns"
  ON countdowns FOR SELECT USING (is_space_member(space_id));

CREATE POLICY "Owner can create countdowns"
  ON countdowns FOR INSERT WITH CHECK (is_space_owner_of_content(space_id));

CREATE POLICY "Owner can update countdowns"
  ON countdowns FOR UPDATE USING (is_space_owner_of_content(space_id));

CREATE POLICY "Owner can delete countdowns"
  ON countdowns FOR DELETE USING (is_space_owner_of_content(space_id));

-- Footprints 策略
CREATE POLICY "Members can view footprints"
  ON footprints FOR SELECT USING (is_space_member(space_id));

CREATE POLICY "Owner can create footprints"
  ON footprints FOR INSERT WITH CHECK (is_space_owner_of_content(space_id));

CREATE POLICY "Owner can update footprints"
  ON footprints FOR UPDATE USING (is_space_owner_of_content(space_id));

CREATE POLICY "Owner can delete footprints"
  ON footprints FOR DELETE USING (is_space_owner_of_content(space_id));

-- ========================================
-- 5. 触发器：自动创建用户资料
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 当新用户创建时，自动创建 profile
  -- 注意：nickname 和 username 需要后续由管理员设置
  INSERT INTO public.profiles (id, username, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 6. 初始化默认空间和示例数据（可选）
-- ========================================

-- 注意：以下初始化数据需要先创建用户后才能执行
-- 建议在 Supabase 控制台手动创建第一个用户后，再执行以下语句

-- 示例：创建默认空间（请替换 <user-id> 为实际的用户 ID）
-- INSERT INTO spaces (name, created_by) VALUES ('我们的Playground', '<user-id>');

-- 示例：创建About us关系
-- INSERT INTO memberships (space_id, user_id, role)
-- VALUES ((SELECT id FROM spaces LIMIT 1), '<user-id>', 'owner');
