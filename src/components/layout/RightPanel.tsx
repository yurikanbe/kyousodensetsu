"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { mockReligions } from "@/lib/mockData";

export default function RightPanel() {
  const { user } = useAuthStore();

  const recommendedReligions = mockReligions
    .filter((r) => !user?.joinedReligionIds.includes(r.id))
    .slice(0, 3);

  if (!user) return null;

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <aside className="w-72 shrink-0 hidden xl:block">
      <div className="sticky top-16 space-y-4 py-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">🏛️ あなたのステータス</h3>
          </div>
          <div className="flex flex-col items-center py-3">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-3xl mb-2">
              {user.avatarIcon}
            </div>
            <p className="font-bold text-gray-800">{user.displayName}</p>
            <p className="text-sm text-gray-500 mb-3">信者レベル Lv.{user.level}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 self-end">
              次のレベルまで: {user.xp} / {user.xpToNext} XP
            </p>
          </div>
          <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between text-sm">
            <div>
              <span className="text-amber-500 mr-1">🪙</span>
              <span className="text-gray-600">所持コイン</span>
            </div>
            <span className="font-bold text-amber-600">{user.coins.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div>
              <span className="mr-1">🏛️</span>
              <span className="text-gray-600">信仰中</span>
            </div>
            <span className="font-bold text-gray-800">{user.joinedReligionIds.length} 宗教</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">🔥 おすすめ宗教</h3>
          <div className="space-y-3">
            {recommendedReligions.map((rel) => (
              <Link key={rel.id} href={`/religion/${rel.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl shrink-0">
                    {rel.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{rel.name}</p>
                    <p className="text-xs text-gray-500">{rel.memberCount.toLocaleString()}人</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
