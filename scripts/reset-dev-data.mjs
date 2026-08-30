/**
 * 開発用: 宗教・投稿・集会チャットを削除し、ユーザーの宗教関連フィールドを初期化する。
 *
 * 使い方:
 *   node scripts/reset-dev-data.mjs
 *   node scripts/reset-dev-data.mjs --coins=100
 *
 * 要: GOOGLE_APPLICATION_CREDENTIALS にサービスアカウント JSON のパスを設定
 *     または gcloud auth application-default login
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const coinsArg = process.argv.find((a) => a.startsWith("--coins="));
const resetCoins = coinsArg ? Number(coinsArg.split("=")[1]) : null;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "kyosodensetsu";
const databaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
  `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

if (getApps().length === 0) {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    initializeApp({
      credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))),
      projectId,
      databaseURL,
    });
  } else {
    initializeApp({ projectId, databaseURL });
  }
}

const db = getFirestore();
const rtdb = getDatabase();

async function deleteCollection(ref, batchSize = 100) {
  const snap = await ref.limit(batchSize).get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size + (await deleteCollection(ref, batchSize));
}

async function deleteDocTree(docRef) {
  const subcols = await docRef.listCollections();
  for (const col of subcols) {
    await deleteCollection(col);
  }
  await docRef.delete();
}

console.log("=== 教祖伝説 開発データリセット ===\n");

// 1. posts + subcollections
console.log("投稿を削除中...");
const postsSnap = await db.collection("posts").get();
let postCount = 0;
for (const doc of postsSnap.docs) {
  await deleteDocTree(doc.ref);
  postCount += 1;
}
console.log(`  posts: ${postCount} 件削除`);

// 2. religions + subcollections
console.log("宗教を削除中...");
const religionsSnap = await db.collection("religions").get();
let religionCount = 0;
for (const doc of religionsSnap.docs) {
  await deleteDocTree(doc.ref);
  religionCount += 1;
}
console.log(`  religions: ${religionCount} 件削除`);

// 3. RTDB chats
console.log("集会チャットを削除中...");
await rtdb.ref("chats").remove();
console.log("  chats: 削除完了");

// 4. Reset users
console.log("ユーザーを初期化中...");
const usersSnap = await db.collection("users").get();
let userCount = 0;
for (const doc of usersSnap.docs) {
  const update = {
    foundedReligionIds: [],
    joinedReligionIds: [],
  };
  if (resetCoins !== null && !Number.isNaN(resetCoins)) {
    update.coins = resetCoins;
  }
  await doc.ref.update(update);
  userCount += 1;
  const name = doc.data().displayName ?? doc.id;
  const coinsMsg = resetCoins !== null ? `, coins=${resetCoins}` : "";
  console.log(`  ${name} (${doc.id})${coinsMsg}`);
}
console.log(`  users: ${userCount} 件更新`);

console.log("\n完了しました。ブラウザをリロードしてください。");
