import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ref, remove } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";

async function deleteQueryBatch(
  colRef: ReturnType<typeof collection>,
  batchSize = 50
): Promise<number> {
  const snap = await getDocs(colRef);
  if (snap.empty) return 0;
  let deleted = 0;
  const chunks: typeof snap.docs[] = [];
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    chunks.push(snap.docs.slice(i, i + batchSize));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

async function deletePost(postId: string): Promise<void> {
  for (const sub of ["prayers", "replies", "missionaries"] as const) {
    await deleteQueryBatch(collection(db, "posts", postId, sub));
  }
  await deleteDoc(doc(db, "posts", postId));
}

async function deleteReligion(religionId: string): Promise<void> {
  const missionsSnap = await getDocs(collection(db, "religions", religionId, "missions"));
  for (const m of missionsSnap.docs) {
    await deleteDoc(m.ref);
  }
  const dailySnap = await getDocs(collection(db, "religions", religionId, "daily"));
  for (const d of dailySnap.docs) {
    const completersSnap = await getDocs(
      collection(db, "religions", religionId, "daily", d.id, "completers")
    );
    for (const c of completersSnap.docs) {
      await deleteDoc(c.ref);
    }
    await deleteDoc(d.ref);
  }
  await deleteDoc(doc(db, "religions", religionId));
}

export interface ResetResult {
  religions: number;
  posts: number;
  chatsCleared: boolean;
  userReset: boolean;
}

export async function resetDevData(
  userId: string,
  options?: { coins?: number }
): Promise<ResetResult> {
  const postsSnap = await getDocs(collection(db, "posts"));
  for (const p of postsSnap.docs) {
    await deletePost(p.id);
  }

  const religionsSnap = await getDocs(collection(db, "religions"));
  for (const r of religionsSnap.docs) {
    await deleteReligion(r.id);
  }

  let chatsCleared = false;
  try {
    await remove(ref(rtdb, "chats"));
    chatsCleared = true;
  } catch {
    chatsCleared = false;
  }

  const userUpdate: Record<string, unknown> = {
    foundedReligionIds: [],
    joinedReligionIds: [],
  };
  if (options?.coins !== undefined) {
    userUpdate.coins = options.coins;
  }
  await updateDoc(doc(db, "users", userId), userUpdate);

  return {
    religions: religionsSnap.size,
    posts: postsSnap.size,
    chatsCleared,
    userReset: true,
  };
}
