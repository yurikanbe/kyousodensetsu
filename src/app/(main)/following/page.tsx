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
    if (!user || user.joinedReligionIds.length === 0) return;
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
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">🔥 信仰中の宗教</h1>
      {joinedReligions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-3">🔥</p>
          <p className="text-gray-500 text-sm">まだ信仰している宗教がありません</p>
          <Link href="/search">
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors">
              宗教を探す
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {joinedReligions.map((religion) => (
            <Link key={religion.id} href={`/religion/${religion.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-3xl shrink-0">
                    {religion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-lg">{religion.name}</p>
                    <p className="text-sm text-gray-500">教祖: {religion.founderName} · Lv.{religion.level}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>👥 {religion.memberCount.toLocaleString()}人</span>
                      <span>🔥 +{religion.weeklyGrowth}人/週</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mb-2">
                      信仰中
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/religion/${religion.id}/assembly`);
                      }}
                      className="text-xs text-purple-600 hover:underline"
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
