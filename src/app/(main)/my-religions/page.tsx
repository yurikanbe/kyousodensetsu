"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";

export default function MyReligionsPage() {
  const { user } = useAuthStore();
  const [religions, setReligions] = useState<Religion[]>([]);

  useEffect(() => {
    if (!user || user.foundedReligionIds.length === 0) return;
    Promise.all(
      user.foundedReligionIds.map((id) => getDoc(doc(db, "religions", id)))
    ).then((snaps) => {
      setReligions(
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

  if (!user || religions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">🏛️ 創設した宗教</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🔱</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">まだ宗教を創設していません</h2>
          <p className="text-sm text-gray-500 mb-6">
            あなただけのオリジナル宗教を作り、信者を集めましょう。
          </p>
          <Link href="/create">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              ＋ 新しい宗教を創設する
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">🏛️ 創設した宗教</h1>
        <Link href="/create">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            ＋ 新しく創設
          </button>
        </Link>
      </div>
      <div className="space-y-3">
        {religions.map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-3xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 text-lg">{religion.name}</p>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      教祖
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Lv.{religion.level} · {religion.category}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>👥 {religion.memberCount.toLocaleString()}人</span>
                    <span>🪙 {religion.totalOfferings.toLocaleString()}お布施</span>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
