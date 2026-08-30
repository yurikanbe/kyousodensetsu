import {
  doc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { grantFrame, grantTitle } from "@/lib/cosmetics";
import { MissionReward } from "@/types";

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export interface GrantRewardsParams {
  userId: string;
  religionId: string;
  missionId?: string;
  rewards: MissionReward[];
}

/**
 * ミッション報酬を付与する。
 * title / frame は所持に追加（既存ならスキップ）。自動装備はしない。
 */
export async function grantMissionRewards({
  userId,
  religionId,
  missionId,
  rewards,
}: GrantRewardsParams): Promise<void> {
  const day = dateKey();

  for (const reward of rewards) {
    switch (reward.type) {
      case "contrib": {
        const amount = reward.amount ?? 0;
        if (amount > 0) {
          await updateDoc(doc(db, "religions", religionId), {
            contributionPoints: increment(amount),
          });
        }
        break;
      }
      case "xp": {
        const amount = reward.amount ?? 0;
        if (amount > 0) {
          await updateDoc(doc(db, "users", userId), { xp: increment(amount) });
        }
        break;
      }
      case "coin": {
        const amount = reward.amount ?? 0;
        if (amount > 0) {
          await updateDoc(doc(db, "users", userId), { coins: increment(amount) });
        }
        break;
      }
      case "appear_today": {
        await setDoc(
          doc(db, "religions", religionId, "daily", day, "completers", userId),
          {
            userId,
            missionId: missionId ?? null,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        break;
      }
      case "title": {
        if (reward.titleId) {
          await grantTitle(userId, reward.titleId, {
            religionId,
            source: "mission",
          });
        }
        break;
      }
      case "frame": {
        if (reward.frameId) {
          await grantFrame(userId, reward.frameId, {
            religionId,
            source: "mission",
          });
        }
        break;
      }
    }
  }
}
