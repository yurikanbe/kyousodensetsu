"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetDevData } from "@/lib/resetDevData";
import { useAuthStore } from "@/store/useAuthStore";

export default function DevResetPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-stone-500 text-sm">
        このページは開発環境でのみ利用できます。
      </div>
    );
  }

  if (!user) return null;

  const handleReset = async () => {
    const ok = window.confirm(
      "宗教・投稿・集会チャットをすべて削除し、\nあなたのアカウントの所属宗教を空に、所持コインを100にします。\n\n本当に実行しますか？"
    );
    if (!ok) return;

    setLoading(true);
    setStatus("リセット中...");
    try {
      const result = await resetDevData(user.id, { coins: 100 });
      setUser({
        ...user,
        foundedReligionIds: [],
        joinedReligionIds: [],
        coins: 100,
      });
      setStatus(
        `完了: 宗教 ${result.religions}件、投稿 ${result.posts}件を削除。` +
          `チャット: ${result.chatsCleared ? "削除済み" : "削除失敗（権限を確認）"}。` +
          ` 所持コインを100に設定しました。`
      );
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setStatus("リセットに失敗しました。Firestore の権限を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white border border-stone-200 p-6">
        <h1 className="text-base font-bold text-stone-900 mb-2 tracking-wide">開発用データリセット</h1>
        <p className="text-xs text-stone-500 leading-relaxed mb-4">
          以下を実行します:
        </p>
        <ul className="text-xs text-stone-600 space-y-1 mb-6 list-disc pl-4">
          <li>全宗教（ミッション含む）を削除</li>
          <li>全投稿（お祈り・返信含む）を削除</li>
          <li>集会チャットを削除</li>
          <li>あなたの所属宗教を空にする</li>
          <li>所持コインを 100 にする</li>
        </ul>
        <p className="text-xs text-red-600 mb-4">
          ※ 他ユーザーのアカウントは変更されません。コスメマスタは残ります。
        </p>
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-bold tracking-widest transition-colors"
        >
          {loading ? "実行中..." : "データをリセット"}
        </button>
        {status && (
          <p className="mt-4 text-xs text-stone-600 whitespace-pre-wrap">{status}</p>
        )}
      </div>
    </div>
  );
}
