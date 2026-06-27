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
        <h1 className="text-base font-bold text-stone-900 mb-4 tracking-wide">創設した宗教</h1>
        <div className="bg-white border border-stone-200 p-10 text-center">
          <div className="text-4xl mb-4 text-stone-300">✦</div>
          <h2 className="text-sm font-bold text-stone-900 mb-2 tracking-wide">まだ宗教を創設していません</h2>
          <p className="text-xs text-stone-500 mb-6">
            あなただけのオリジナル宗教を作り、信者を集めましょう。
          </p>
          <Link href="/create">
            <button className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-3 text-sm tracking-wide transition-colors">
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
        <h1 className="text-base font-bold text-stone-900 tracking-wide">創設した宗教</h1>
        <Link href="/create">
          <button className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-4 py-2 text-xs tracking-wide transition-colors">
            ＋ 新しく創設
          </button>
        </Link>
      </div>
      <div className="space-y-2">
        {religions.map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}`}>
            <div className="bg-white border border-stone-200 p-5 hover:border-stone-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-3xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900">{religion.name}</p>
                    <span className="text-xs bg-stone-900 text-white px-2 py-0.5 font-medium tracking-wide">
                      教祖
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Lv.{religion.level} · {religion.category}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                    <span>👥 {religion.memberCount.toLocaleString()}人</span>
                    <span>🪙 {religion.totalOfferings.toLocaleString()} お布施</span>
                  </div>
                </div>
                <span className="text-stone-400 text-sm">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
