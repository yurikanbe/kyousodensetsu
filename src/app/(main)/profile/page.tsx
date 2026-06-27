"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { RELIGION_ICONS } from "@/types";
import { Religion, Post } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [joinedReligions, setJoinedReligions] = useState<Religion[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) return;

    if (user.joinedReligionIds.length > 0) {
      Promise.all(
        user.joinedReligionIds.map((id) => getDoc(doc(db, "religions", id)))
      ).then((snaps) => {
        setJoinedReligions(
          snaps
            .filter((s) => s.exists())
            .map((s) => ({
              id: s.id,
              ...s.data(),
              createdAt: (s.data()!.createdAt as Timestamp)?.toDate() ?? new Date(),
            } as Religion))
        );
      });
    }

    getDocs(query(collection(db, "posts"), where("authorId", "==", user.id))).then((snap) => {
      const posts = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          hasPrayed: false,
          createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Post))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setMyPosts(posts);
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/auth");
  };

  const handleAvatarChange = async (icon: string) => {
    if (!user || user.coins < 200 || user.avatarIcon === icon) return;
    await updateDoc(doc(db, "users", user.id), {
      avatarIcon: icon,
      coins: user.coins - 200,
    });
    setUser({ ...user, avatarIcon: icon, coins: user.coins - 200 });
  };

  if (!user) return null;

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-stone-900 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-full bg-white/10 flex items-center justify-center text-4xl w-20 h-20">
            {user.avatarIcon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">{user.displayName}</h1>
            <p className="text-stone-400 text-sm mt-0.5">信者レベル Lv.{user.level}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-stone-400">
              <span>🪙 {user.coins.toLocaleString()} コイン</span>
              <span>{user.joinedReligionIds.length} 宗教</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-stone-500 mb-1">
            <span>経験値</span>
            <span>{user.xp} / {user.xpToNext} XP</span>
          </div>
          <div className="w-full bg-white/10 h-1">
            <div
              className="bg-white h-1 transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "信仰中の宗教", value: user.joinedReligionIds.length },
          { label: "レベル", value: user.level },
          { label: "所持コイン", value: user.coins.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-stone-200 p-4 text-center">
            <p className="text-xl font-bold text-stone-900">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {joinedReligions.length > 0 && (
        <div className="bg-white border border-stone-200 p-4">
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">信仰中の宗教</p>
          <div className="space-y-1">
            {joinedReligions.map((rel) => (
              <Link key={rel.id} href={`/religion/${rel.id}`}>
                <div className="flex items-center gap-3 p-3 hover:bg-stone-50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-lg">
                    {rel.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{rel.name}</p>
                    <p className="text-xs text-stone-500">👥 {rel.memberCount.toLocaleString()}人 · Lv.{rel.level}</p>
                  </div>
                  <span className="text-stone-400 text-xs">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 p-4">
        <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-1">アバターアイコン変更</p>
        <p className="text-xs text-stone-400 mb-3">コイン200枚で変更できます（現在: {user.coins}枚）</p>
        <div className="grid grid-cols-10 gap-2">
          {RELIGION_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => handleAvatarChange(icon)}
              disabled={user.coins < 200 && user.avatarIcon !== icon}
              className={`w-9 h-9 flex items-center justify-center text-xl transition-all hover:scale-110 disabled:opacity-40 ${
                user.avatarIcon === icon
                  ? "bg-stone-900 ring-2 ring-stone-400"
                  : "bg-stone-100 hover:bg-stone-200"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {myPosts.length > 0 && (
        <div className="bg-white border border-stone-200 p-4">
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">自分の投稿</p>
          <div className="space-y-2">
            {myPosts.map((post) => (
              <div key={post.id} className="p-3 bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-stone-600">{post.type}</span>
                  <span className="text-xs text-stone-400">· {post.religionName}</span>
                </div>
                <p className="text-sm text-stone-800 line-clamp-2">{post.content}</p>
                <div className="flex gap-3 mt-2 text-xs text-stone-400">
                  <span>🙏 {post.prayerCount}</span>
                  <span>💬 {post.replyCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pb-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm tracking-wide transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
