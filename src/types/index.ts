export type UserRole = "教祖" | "副教祖" | "信者";

export type CosmeticRarity = "common" | "rare" | "epic";

export type MissionAction =
  | "pray"
  | "post"
  | "reply"
  | "missionary"
  | "offer"
  | "visit"
  | "dm_founder"
  | "dm_member";

export type MissionTarget = "own_religion" | "founder_posts" | "assembly";

export type RewardType =
  | "contrib"
  | "appear_today"
  | "xp"
  | "coin"
  | "title"
  | "frame";

export interface MissionReward {
  type: RewardType;
  amount?: number;
  titleId?: string;
  frameId?: string;
}

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
  equippedTitleId?: string | null;
  equippedFrameId?: string | null;
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
  contributionPoints?: number;
  faithGauge?: number;
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

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorIcon: string;
  content: string;
  createdAt: Date;
}

/** デイリーミッション（パーツ組み合わせ） */
export interface Mission {
  id: string;
  religionId: string;
  action: MissionAction;
  target: MissionTarget;
  label: string;
  rewards: MissionReward[];
  active: boolean;
  order: number;
  /** @deprecated 旧データ互換 */
  title?: string;
  /** @deprecated 旧データ互換 */
  reward?: number;
  /** クライアント側の当日達成フラグ */
  completed?: boolean;
}

export interface TitleMaster {
  id: string;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  iconKey?: string;
  sourceHint?: string;
}

export interface FrameMaster {
  id: string;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  cssKey: string;
  sourceHint?: string;
}

export interface OwnedCosmetic {
  id: string;
  earnedAt: Date;
  religionId?: string;
  source: "mission" | "offering" | "event" | "seed";
}

export interface Member {
  userId: string;
  displayName: string;
  avatarIcon: string;
  role: UserRole;
  level: number;
  equippedTitleId?: string | null;
  equippedFrameId?: string | null;
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

export const MISSION_ACTION_LABELS: Record<MissionAction, string> = {
  pray: "お祈りする",
  post: "TLに一言流す",
  reply: "返信する",
  missionary: "布教する",
  offer: "お布施する",
  visit: "参拝する",
  dm_founder: "教祖にDMする",
  dm_member: "信者にDMする",
};

export const MISSION_TARGET_LABELS: Record<MissionTarget, string> = {
  own_religion: "この宗教",
  founder_posts: "教祖の啓示",
  assembly: "集会",
};
