"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";

export default function FollowingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [joinedReligions, setJoinedReligions] = useState<Religion[]>([]);

  useEffect(() => {
    if (!user) return;
    const followedOnlyIds = user.joinedReligionIds.filter(
      (id) => !user.foundedReligionIds.includes(id)
    );
    if (followedOnlyIds.length === 0) {
      setJoinedReligions([]);
      return;
    }
    Promise.all(
      followedOnlyIds.map((id) => getDoc(doc(db, "religions", id)))
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
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-base font-bold text-stone-900 mb-4 tracking-wide">信仰中の宗教</h1>
      {joinedReligions.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center">
          <p className="text-stone-500 text-sm mb-4">まだ信仰している宗教がありません</p>
          <Link href="/search">
            <button className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-2 text-xs tracking-widest transition-colors">
              宗教を探す
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {joinedReligions.map((religion) => (
            <Link key={religion.id} href={`/religion/${religion.id}`}>
              <div className="bg-white border border-stone-200 p-5 hover:border-stone-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-lg font-bold text-stone-700 shrink-0">
                    {religion.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900">{religion.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">教祖: {religion.founderName} · Lv.{religion.level}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                      <span>{religion.memberCount.toLocaleString()} 人</span>
                      <span>+{religion.weeklyGrowth} 人/週</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs border border-stone-300 text-stone-700 px-2 py-1 font-medium mb-2">
                      信仰中
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/religion/${religion.id}/assembly`);
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 tracking-wide transition-colors"
                    >
                      集会へ →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
