"use client";
import { useState } from "react";
import Link from "next/link";
import { mockReligions } from "@/lib/mockData";
import { RELIGION_CATEGORIES } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const categories = ["すべて", ...RELIGION_CATEGORIES];

  const results = mockReligions.filter((r) => {
    const matchQuery =
      !query || r.name.includes(query) || r.doctrine.includes(query) || r.founderName.includes(query);
    const matchCategory = selectedCategory === "すべて" || r.category === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">🔍 宗教を探す</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          placeholder="宗教名・教義・教祖名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{religion.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {religion.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">教祖: {religion.founderName} · Lv.{religion.level}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{religion.doctrine}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>👥 {religion.memberCount.toLocaleString()}人</span>
                    <span>📖 {religion.scriptureCount}経典</span>
                    <span>🪙 {religion.totalOfferings.toLocaleString()}お布施</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {results.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>該当する宗教が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
