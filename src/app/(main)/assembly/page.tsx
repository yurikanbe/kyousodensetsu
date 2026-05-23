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
      <h1 className="text-xl font-bold text-gray-800 mb-4">💬 集会一覧</h1>
      {religions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 text-sm">
            まだ参加している宗教がありません。宗教に入信して集会に参加しましょう。
          </p>
          <Link href="/search">
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors">
              宗教を探す
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {religions.map((religion) => (
            <Link key={religion.id} href={`/religion/${religion.id}/assembly`}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{religion.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-xs text-gray-500">集会に参加する</span>
                  </div>
                </div>
                <span className="text-purple-600 text-sm font-medium">参加する →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
