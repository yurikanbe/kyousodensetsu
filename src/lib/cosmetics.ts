import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEED_FRAMES, SEED_TITLES } from "@/data/cosmeticsSeed";
import {
  FrameMaster,
  OwnedCosmetic,
  TitleMaster,
} from "@/types";
export const FRAME_CSS: Record<string, string> = {
  "frame-none": "",
  "frame-wood": "ring-2 ring-amber-700 ring-offset-2 ring-offset-white",
  "frame-stone": "ring-2 ring-stone-500 ring-offset-2 ring-offset-white",
  "frame-gold": "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_0_1px_rgba(251,191,36,0.4)]",
};

export async function fetchTitleMasters(): Promise<TitleMaster[]> {
  const snap = await getDocs(collection(db, "cosmetics", "titles", "items"));
  if (snap.empty) return [];
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TitleMaster));
}

export async function fetchFrameMasters(): Promise<FrameMaster[]> {
  const snap = await getDocs(collection(db, "cosmetics", "frames", "items"));
  if (snap.empty) return [];
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FrameMaster));
}

export async function fetchOwnedTitles(userId: string): Promise<OwnedCosmetic[]> {
  const snap = await getDocs(collection(db, "users", userId, "titles"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    earnedAt: (d.data().earnedAt as Timestamp)?.toDate() ?? new Date(),
  } as OwnedCosmetic));
}

export async function fetchOwnedFrames(userId: string): Promise<OwnedCosmetic[]> {
  const snap = await getDocs(collection(db, "users", userId, "frames"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    earnedAt: (d.data().earnedAt as Timestamp)?.toDate() ?? new Date(),
  } as OwnedCosmetic));
}

/** マスタが空なら初期データを投入する */
export async function seedCosmeticsMaster(): Promise<{ titles: number; frames: number }> {
  let titles = 0;
  let frames = 0;

  for (const title of SEED_TITLES) {
    const ref = doc(db, "cosmetics", "titles", "items", title.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const { id, ...data } = title;
      await setDoc(ref, data);
      titles += 1;
    }
  }

  for (const frame of SEED_FRAMES) {
    const ref = doc(db, "cosmetics", "frames", "items", frame.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const { id, ...data } = frame;
      await setDoc(ref, data);
      frames += 1;
    }
  }

  return { titles, frames };
}

export async function grantTitle(
  userId: string,
  titleId: string,
  options?: { religionId?: string; source?: OwnedCosmetic["source"] }
): Promise<boolean> {
  const ref = doc(db, "users", userId, "titles", titleId);
  const snap = await getDoc(ref);
  if (snap.exists()) return false;
  await setDoc(ref, {
    earnedAt: serverTimestamp(),
    religionId: options?.religionId ?? null,
    source: options?.source ?? "mission",
  });
  return true;
}

export async function grantFrame(
  userId: string,
  frameId: string,
  options?: { religionId?: string; source?: OwnedCosmetic["source"] }
): Promise<boolean> {
  const ref = doc(db, "users", userId, "frames", frameId);
  const snap = await getDoc(ref);
  if (snap.exists()) return false;
  await setDoc(ref, {
    earnedAt: serverTimestamp(),
    religionId: options?.religionId ?? null,
    source: options?.source ?? "mission",
  });
  return true;
}

export async function equipTitle(userId: string, titleId: string | null): Promise<void> {
  await updateDoc(doc(db, "users", userId), { equippedTitleId: titleId });
}

export async function equipFrame(userId: string, frameId: string | null): Promise<void> {
  await updateDoc(doc(db, "users", userId), { equippedFrameId: frameId });
}

/** 新規ユーザーに枠なしを所持させる */
export async function ensureDefaultFrame(userId: string): Promise<void> {
  await grantFrame(userId, "frame_none", { source: "seed" });
  const userSnap = await getDoc(doc(db, "users", userId));
  if (userSnap.exists() && !userSnap.data().equippedFrameId) {
    await equipFrame(userId, "frame_none");
  }
}

export function getFrameCssClass(cssKey?: string | null): string {
  if (!cssKey) return "";
  return FRAME_CSS[cssKey] ?? "";
}

/** equippedFrameId から cssKey を解決（マスタ未取得時のフォールバック含む） */
export function frameCssKeyFromId(frameId?: string | null): string | null {
  if (!frameId) return null;
  return SEED_FRAMES.find((f) => f.id === frameId)?.cssKey ?? null;
}
