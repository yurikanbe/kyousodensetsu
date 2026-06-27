"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RELIGION_CATEGORIES } from "@/types";
import { Religion } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [allReligions, setAllReligions] = useState<Religion[]>([]);

  const categories = ["すべて", ...RELIGION_CATEGORIES];

  useEffect(() => {
    getDocs(collection(db, "religions")).then((snap) => {
      setAllReligions(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Religion))
      );
    });
  }, []);

  const results = allReligions.filter((r) => {
    const matchQuery =
      !query || r.name.includes(query) || r.doctrine.includes(query) || r.founderName.includes(query);
    const matchCategory = selectedCategory === "すべて" || r.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-base font-bold text-stone-900 mb-4 tracking-wide">宗教を探す</h1>

      <div className="bg-white border border-stone-200 p-4 mb-4">
        <input
          type="text"
          placeholder="宗教名・教義・教祖名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-400 mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}`}>
            <div className="bg-white border border-stone-200 p-4 hover:border-stone-400 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-stone-100 flex items-center justify-center text-base font-bold text-stone-700 shrink-0">
                  {religion.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-stone-900">{religion.name}</h3>
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5">
                      {religion.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">教祖: {religion.founderName} · Lv.{religion.level}</p>
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">{religion.doctrine}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span>{religion.memberCount.toLocaleString()} 人</span>
                    <span>{religion.scriptureCount} 経典</span>
                    <span>{religion.totalOfferings.toLocaleString()} コイン</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {results.length === 0 && allReligions.length > 0 && (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">該当する宗教が見つかりませんでした</p>
          </div>
        )}
        {allReligions.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">まだ宗教がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
