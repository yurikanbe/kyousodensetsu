"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";

export default function RightPanel() {
  const { user } = useAuthStore();
  const [recommendedReligions, setRecommendedReligions] = useState<Religion[]>([]);

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, "religions")).then((snap) => {
      const all = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
      } as Religion));
      setRecommendedReligions(
        all.filter((r) => !user.joinedReligionIds.includes(r.id)).slice(0, 3)
      );
    });
  }, [user]);

  if (!user) return null;

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <aside className="w-72 shrink-0 hidden xl:block">
      <div className="sticky top-16 space-y-3 py-4">
        <div className="bg-white border border-stone-200 p-4">
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">あなたのステータス</p>
          <div className="flex flex-col items-center py-3">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-3xl mb-2">
              {user.avatarIcon}
            </div>
            <p className="font-bold text-stone-900">{user.displayName}</p>
            <p className="text-xs text-stone-500 mb-3">信者レベル Lv.{user.level}</p>
            <div className="w-full bg-stone-100 h-1 mb-1">
              <div
                className="bg-stone-900 h-1 transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 self-end">
              {user.xp} / {user.xpToNext} XP
            </p>
          </div>
          <div className="border-t border-stone-100 pt-3 mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">所持コイン</span>
              <span className="font-bold text-stone-900">{user.coins.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">信仰中</span>
              <span className="font-bold text-stone-900">{user.joinedReligionIds.length} 宗教</span>
            </div>
          </div>
        </div>

        {recommendedReligions.length > 0 && (
          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">おすすめ宗教</p>
            <div className="space-y-2">
              {recommendedReligions.map((rel) => (
                <Link key={rel.id} href={`/religion/${rel.id}`}>
                  <div className="flex items-center gap-3 p-2 hover:bg-stone-50 cursor-pointer transition-colors">
                    <div className="w-9 h-9 bg-stone-100 flex items-center justify-center text-lg shrink-0">
                      {rel.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{rel.name}</p>
                      <p className="text-xs text-stone-500">{rel.memberCount.toLocaleString()}人</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
