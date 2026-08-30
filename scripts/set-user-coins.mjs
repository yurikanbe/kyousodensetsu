import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

const displayName = process.argv[2] ?? "育毛剤マヒヤ";
const coins = Number(process.argv[3] ?? 100);
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "kyosodensetsu";

if (getApps().length === 0) {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && existsSync(keyPath)) {
    initializeApp({
      credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))),
      projectId,
    });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();
const snap = await db.collection("users").where("displayName", "==", displayName).get();

if (snap.empty) {
  console.error(`ユーザー「${displayName}」が見つかりません`);
  process.exit(1);
}

for (const doc of snap.docs) {
  const before = doc.data().coins;
  await doc.ref.update({ coins });
  console.log(`更新: ${doc.id} ${before} → ${coins}`);
}
