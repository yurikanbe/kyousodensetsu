"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { RELIGION_CATEGORIES } from "@/types";

export default function CreateReligionPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState("");
  const [doctrine, setDoctrine] = useState("");
  const [category, setCategory] = useState(RELIGION_CATEGORIES[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("宗教名を入力してください");
      return;
    }
    if (name.length > 20) {
      setError("宗教名は20文字以内で入力してください");
      return;
    }
    if (!doctrine.trim()) {
      setError("教義を入力してください");
      return;
    }
    if (!user) {
      setError("ログインが必要です");
      return;
    }

    setIsSubmitting(true);
    try {
      const religionRef = await addDoc(collection(db, "religions"), {
        name: name.trim(),
        icon: name.trim().charAt(0),
        doctrine: doctrine.trim(),
        category,
        isPublic,
        founderUserId: user.id,
        founderName: user.displayName,
        memberCount: 1,
        level: 1,
        scriptureCount: 0,
        hymnCount: 0,
        totalOfferings: 0,
        weeklyGrowth: 0,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", user.id), {
        foundedReligionIds: arrayUnion(religionRef.id),
        joinedReligionIds: arrayUnion(religionRef.id),
      });

      setUser({
        ...user,
        foundedReligionIds: [...user.foundedReligionIds, religionRef.id],
        joinedReligionIds: [...user.joinedReligionIds, religionRef.id],
      });

      router.push(`/religion/${religionRef.id}`);
    } catch {
      setError("宗教の創設に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-stone-200 overflow-hidden">
        <div className="bg-stone-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-sm font-light tracking-widest">✦</span>
            <div>
              <h1 className="text-base font-bold tracking-wider">新しい宗教を創設する</h1>
              <p className="text-stone-400 text-xs mt-0.5">あなただけの宗教を作り、信者を集めましょう</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-stone-100 border border-stone-300 text-stone-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 tracking-widest uppercase">
              宗教名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：お昼寝最高教"
              maxLength={20}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-400"
            />
            <p className="text-xs text-stone-400 mt-1 text-right">{name.length}/20 ※後から変更できません</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 tracking-widest uppercase">
              教義
            </label>
            <textarea
              value={doctrine}
              onChange={(e) => setDoctrine(e.target.value)}
              placeholder="例：昼食後の眠気は自然の摂理である。我々は午後の一時、静かに目を閉じ、心身を休める。15分の仮眠は3時間の修行に匹敵する。眠れ、そして目覚めよ。"
              rows={5}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2 tracking-widest uppercase">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-white"
            >
              {RELIGION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-3 tracking-widest uppercase">
              公開設定
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 accent-stone-900"
                />
                <div>
                  <span className="text-sm font-medium text-stone-900">公開</span>
                  <p className="text-xs text-stone-500">誰でも参加可能</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 accent-stone-900"
                />
                <div>
                  <span className="text-sm font-medium text-stone-900">承認制</span>
                  <p className="text-xs text-stone-500">教祖が承認した人のみ</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 tracking-widest text-sm transition-colors"
            >
              {isSubmitting ? "創設中..." : "宗教を創設する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
