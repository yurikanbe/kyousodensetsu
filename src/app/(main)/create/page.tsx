"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RELIGION_ICONS, RELIGION_CATEGORIES } from "@/types";

export default function CreateReligionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(RELIGION_ICONS[0]);
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

    setIsSubmitting(true);
    // Firestore連携後に実装: 宗教データを保存
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔱</span>
            <div>
              <h1 className="text-xl font-bold">新しい宗教を創設する</h1>
              <p className="text-purple-200 text-sm">あなただけの宗教を作り、信者を集めましょう</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏛️ 宗教名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：お昼寝最高教"
              maxLength={20}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{name.length}/20 ※後から変更できません</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🎯 アイコンを選択
            </label>
            <div className="grid grid-cols-10 gap-2">
              {RELIGION_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                    selectedIcon === icon
                      ? "bg-purple-600 ring-2 ring-purple-400 ring-offset-1 scale-110"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">選択中：</span>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-3xl">
                {selectedIcon}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📖 教義（あなたの教えを記しましょう）
            </label>
            <textarea
              value={doctrine}
              onChange={(e) => setDoctrine(e.target.value)}
              placeholder="例：昼食後の眠気は自然の摂理である。我々は午後の一時、静かに目を閉じ、心身を休める。15分の仮眠は3時間の修行に匹敵する。眠れ、そして目覚めよ。"
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📂 カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {RELIGION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔒 公開設定
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">公開</span>
                  <p className="text-xs text-gray-500">誰でも参加可能</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">承認制</span>
                  <p className="text-xs text-gray-500">教祖が承認した人のみ</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> 創設中...
                </>
              ) : (
                <>🔱 宗教を創設する</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
