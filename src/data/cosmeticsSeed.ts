import { FrameMaster, TitleMaster } from "@/types";

/** Firestore `cosmetics/titles/{id}` 初期マスタ */
export const SEED_TITLES: TitleMaster[] = [
  {
    id: "title_prayer",
    name: "今日の祈り手",
    description: "お祈りのミッションを達成した証",
    rarity: "common",
    iconKey: "pray",
    sourceHint: "mission_pray",
  },
  {
    id: "title_missionary",
    name: "今日の伝道者",
    description: "布教のミッションを達成した証",
    rarity: "common",
    iconKey: "share",
    sourceHint: "mission_missionary",
  },
  {
    id: "title_scribe",
    name: "一言僧",
    description: "TLに一言を流した証",
    rarity: "common",
    iconKey: "post",
    sourceHint: "mission_post",
  },
  {
    id: "title_offerer",
    name: "奉納者",
    description: "お布施を捧げた証",
    rarity: "rare",
    iconKey: "offer",
    sourceHint: "mission_offer",
  },
  {
    id: "title_visitor",
    name: "参拝者",
    description: "今日の参拝を果たした証",
    rarity: "common",
    iconKey: "visit",
    sourceHint: "mission_visit",
  },
];

/** Firestore `cosmetics/frames/{id}` 初期マスタ */
export const SEED_FRAMES: FrameMaster[] = [
  {
    id: "frame_none",
    name: "枠なし",
    description: "デフォルトの見た目",
    rarity: "common",
    cssKey: "frame-none",
    sourceHint: "default",
  },
  {
    id: "frame_wood",
    name: "木枠",
    description: "素朴な木のフレーム",
    rarity: "common",
    cssKey: "frame-wood",
    sourceHint: "mission_common",
  },
  {
    id: "frame_stone",
    name: "石枠",
    description: "落ち着いた石のフレーム",
    rarity: "rare",
    cssKey: "frame-stone",
    sourceHint: "mission_rare",
  },
  {
    id: "frame_gold",
    name: "金枠",
    description: "輝く金のフレーム",
    rarity: "epic",
    cssKey: "frame-gold",
    sourceHint: "event",
  },
];
