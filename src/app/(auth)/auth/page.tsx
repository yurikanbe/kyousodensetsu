"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { RELIGION_ICONS } from "@/types";
import { User } from "@/types";

const provider = new GoogleAuthProvider();

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const credential = await signInWithPopup(auth, provider);
      const firebaseUser = credential.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        setUser({
          id: firebaseUser.uid,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        } as User);
      } else {
        const randomIcon = RELIGION_ICONS[Math.floor(Math.random() * RELIGION_ICONS.length)];
        const userData = {
          displayName: firebaseUser.displayName ?? "名無しの信者",
          email: firebaseUser.email ?? "",
          avatarIcon: randomIcon,
          coins: 0,
          level: 1,
          xp: 0,
          xpToNext: 100,
          foundedReligionIds: [] as string[],
          joinedReligionIds: [] as string[],
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, userData);
        setUser({
          id: firebaseUser.uid,
          ...userData,
          createdAt: new Date(),
        } as User);
      }

      router.push("/");
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "auth/popup-closed-by-user") {
        // ユーザーがポップアップを閉じた場合は何もしない
      } else {
        setError("Googleサインインに失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✦</div>
          <h1 className="text-4xl font-bold text-white mb-2">教祖伝説</h1>
          <p className="text-purple-200 italic">〜 あなただけの宗教を、世界へ 〜</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-center text-lg font-bold text-gray-800 mb-2">ログイン / 新規登録</h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Googleアカウントでかんたん登録
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-60 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 rounded-xl transition-all shadow-sm"
          >
            {isLoading ? (
              <span className="animate-spin text-xl">⏳</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Googleでサインイン
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              サインインすることで、利用規約とプライバシーポリシーに同意したものとみなします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
