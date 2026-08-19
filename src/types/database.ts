export type Database = {
  public: {
    Tables: {
      spaces: {
        Row: {
          id: string;
          name: string;
          cover_image: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cover_image?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cover_image?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          nickname: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          nickname?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          space_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          user_id?: string;
          role?: "owner" | "member";
          created_at?: string;
        };
      };
      moments: {
        Row: {
          id: string;
          space_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          space_id: string;
          author_id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          space_id: string;
          author_id: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          space_id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          owner_type: "moment" | "article";
          owner_id: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_type: "moment" | "article";
          owner_id: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_type?: "moment" | "article";
          owner_id?: string;
          url?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          target_type: "moment" | "article";
          target_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: "moment" | "article";
          target_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_type?: "moment" | "article";
          target_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

type ProfileWithUsername = {
  username: string;
  nickname: string;
  avatar_url: string | null;
};

export type EditHistory = {
  id: string;
  target_type: "moment" | "article";
  target_id: string;
  editor_id: string;
  edited_at: string;
};

export type Moment = Database["public"]["Tables"]["moments"]["Row"] & {
  profiles: ProfileWithUsername | null;
  photos: { id: string; url: string }[];
  comments_count?: number;
  edit_history: EditHistory[];
};

export type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  profiles: ProfileWithUsername | null;
  photos: { id: string; url: string }[];
  edit_history: EditHistory[];
};

export type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles: ProfileWithUsername | null;
};

export type Countdown = {
  id: string;
  space_id: string;
  title: string;
  target_date: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Footprint = {
  id: string;
  space_id: string;
  province: string;
  city: string;
  visit_year: number;
  visit_month: number;
  sort_order: number;
  note: string | null;
  created_at: string;
};

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
