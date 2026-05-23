"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { mockReligions, mockPosts } from "@/lib/mockData";
import { RELIGION_ICONS } from "@/types";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500">ログインが必要です</p>
        <Link href="/auth">
          <button className="bg-purple-600 text-white px-6 py-2 rounded-xl">
            ログインする
          </button>
        </Link>
      </div>
    );
  }

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const joinedReligions = mockReligions.filter((r) =>
    user.joinedReligionIds.includes(r.id)
  );
  const myPosts = mockPosts.filter((p) => p.authorId === user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
            {user.avatarIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-purple-200 text-sm">信者レベル Lv.{user.level}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-purple-200">
              <span>🪙 {user.coins.toLocaleString()} コイン</span>
              <span>🏛️ {user.joinedReligionIds.length} 宗教</span>
            </div>
          </div>
          <button className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors">
            編集
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-purple-200 mb-1">
            <span>経験値</span>
            <span>{user.xp} / {user.xpToNext} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className="bg-white h-2.5 rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "信仰中の宗教", value: user.joinedReligionIds.length, icon: "🏛️" },
          { label: "レベル", value: user.level, icon: "⭐" },
          { label: "所持コイン", value: user.coins.toLocaleString(), icon: "🪙" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-bold text-gray-800 mb-3">🏛️ 信仰中の宗教</h2>
        <div className="space-y-2">
          {joinedReligions.map((rel) => (
            <Link key={rel.id} href={`/religion/${rel.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                  {rel.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{rel.name}</p>
                  <p className="text-xs text-gray-500">👥 {rel.memberCount.toLocaleString()}人 · Lv.{rel.level}</p>
                </div>
                <span className="text-gray-400 text-xs">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-bold text-gray-800 mb-1">🎯 アバターアイコン変更</h2>
        <p className="text-xs text-gray-400 mb-3">コイン200枚でアイコンを変更できます</p>
        <div className="grid grid-cols-10 gap-2">
          {RELIGION_ICONS.map((icon) => (
            <button
              key={icon}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                user.avatarIcon === icon
                  ? "bg-purple-600 ring-2 ring-purple-400"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {myPosts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-gray-800 mb-3">📝 自分の投稿</h2>
          <div className="space-y-3">
            {myPosts.map((post) => (
              <div key={post.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">{post.type}</span>
                  <span className="text-xs text-gray-400">· {post.religionName}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>🙏 {post.prayerCount}</span>
                  <span>💬 {post.replyCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pb-4">
        <button className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
          ログアウト
        </button>
      </div>
    </div>
  );
}
