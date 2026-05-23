export type UserRole = "教祖" | "副教祖" | "信者";

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarIcon: string;
  coins: number;
  level: number;
  xp: number;
  xpToNext: number;
  foundedReligionIds: string[];
  joinedReligionIds: string[];
  createdAt: Date;
}

export interface Religion {
  id: string;
  name: string;
  icon: string;
  doctrine: string;
  category: string;
  isPublic: boolean;
  founderUserId: string;
  founderName: string;
  memberCount: number;
  level: number;
  scriptureCount: number;
  hymnCount: number;
  totalOfferings: number;
  weeklyGrowth: number;
  pinnedMessage?: string;
  createdAt: Date;
}

export type PostType = "啓示" | "経典" | "ミッション達成" | "お知らせ";

export interface Post {
  id: string;
  religionId: string;
  religionName: string;
  religionIcon: string;
  authorId: string;
  authorName: string;
  authorIcon: string;
  authorRole: UserRole;
  type: PostType;
  content: string;
  scriptureTitle?: string;
  prayerCount: number;
  replyCount: number;
  missionaryCount: number;
  coinsEarned?: number;
  hasPrayed: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  religionId: string;
  authorId: string;
  authorName: string;
  authorIcon: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface Mission {
  id: string;
  religionId: string;
  title: string;
  reward: number;
  completed: boolean;
}

export interface Member {
  userId: string;
  displayName: string;
  avatarIcon: string;
  role: UserRole;
  level: number;
}

export const RELIGION_ICONS = [
  "🍞", "☕", "🐱", "😮", "🎮", "🏃", "🍜", "📚", "🎵", "🌿",
  "🌟", "🔥", "🌙", "⚡", "🌈", "🦋", "🌸", "🍀", "🎯", "🏆"
];

export const RELIGION_CATEGORIES = [
  "ライフスタイル",
  "食文化",
  "趣味・エンタメ",
  "スポーツ",
  "学問・教養",
  "自然・環境",
  "アート・音楽",
  "テクノロジー",
  "癒し・マインド",
  "その他",
];

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
  5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
];
