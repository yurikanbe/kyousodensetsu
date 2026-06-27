"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";

export default function AssemblyListPage() {
  const { user } = useAuthStore();
  const [religions, setReligions] = useState<Religion[]>([]);

  useEffect(() => {
    if (!user || user.joinedReligionIds.length === 0) return;
    Promise.all(
      user.joinedReligionIds.map((id) => getDoc(doc(db, "religions", id)))
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-base font-bold text-stone-900 mb-4 tracking-wide">集会一覧</h1>
      {religions.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center">
          <p className="text-3xl mb-3 text-stone-300">💬</p>
          <p className="text-stone-500 text-sm mb-4">
            まだ参加している宗教がありません。宗教に入信して集会に参加しましょう。
          </p>
          <Link href="/search">
            <button className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-2 text-sm tracking-wide transition-colors">
              宗教を探す
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {religions.map((religion) => (
            <Link key={religion.id} href={`/religion/${religion.id}/assembly`}>
              <div className="bg-white border border-stone-200 p-4 flex items-center gap-4 hover:border-stone-400 transition-colors cursor-pointer">
                <div className="w-11 h-11 bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900">{religion.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span className="text-xs text-stone-500">集会に参加する</span>
                  </div>
                </div>
                <span className="text-stone-700 text-xs font-medium tracking-wide">参加する →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
