"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Religion } from "@/types";

type SortKey = "memberCount" | "level" | "totalOfferings" | "weeklyGrowth";

const SORT_LABELS: Record<SortKey, string> = {
  memberCount: "信者数",
  level: "教祖レベル",
  totalOfferings: "お布施額",
  weeklyGrowth: "急上昇",
};

const RANK_STYLES = ["bg-amber-400", "bg-gray-400", "bg-amber-700"];

export default function RankingPage() {
  const [sortKey, setSortKey] = useState<SortKey>("memberCount");
  const [search, setSearch] = useState("");
  const [religions, setReligions] = useState<Religion[]>([]);

  useEffect(() => {
    getDocs(collection(db, "religions")).then((snap) => {
      setReligions(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Religion))
      );
    });
  }, []);

  const sorted = [...religions]
    .filter((r) => r.name.includes(search) || r.founderName.includes(search))
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const trending = [...religions]
    .sort((a, b) => b.weeklyGrowth - a.weeklyGrowth)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🏆 宗教ランキング
            </h1>

            <div className="flex gap-2 flex-wrap mb-4">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sortKey === key
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {key === "weeklyGrowth" ? "🔥" : ""} {SORT_LABELS[key]}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sorted.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">🏆</p>
                  <p>まだ宗教がありません</p>
                </div>
              ) : (
                sorted.map((religion, index) => (
                  <RankingItem
                    key={religion.id}
                    religion={religion}
                    rank={index + 1}
                    sortKey={sortKey}
                    rankStyle={RANK_STYLES[index] ?? ""}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-56 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">🔍 宗教を探す</h3>
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {trending.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-1">
                🔥 急上昇
              </h3>
              <div className="space-y-3">
                {trending.map((rel, i) => (
                  <Link key={rel.id} href={`/religion/${rel.id}`}>
                    <div className="flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <span className="text-xs font-bold text-orange-500 w-4">#{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{rel.name}</p>
                        <p className="text-xs text-orange-500">+{rel.weeklyGrowth.toLocaleString()} 今週</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RankingItem({
  religion,
  rank,
  sortKey,
  rankStyle,
}: {
  religion: Religion;
  rank: number;
  sortKey: SortKey;
  rankStyle: string;
}) {
  const VALUE_DISPLAY: Record<SortKey, string> = {
    memberCount: `${religion.memberCount.toLocaleString()} 人`,
    level: `Lv.${religion.level}`,
    totalOfferings: `🪙 ${religion.totalOfferings.toLocaleString()}`,
    weeklyGrowth: `+${religion.weeklyGrowth.toLocaleString()} 今週`,
  };

  return (
    <Link href={`/religion/${religion.id}`}>
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
          rank <= 3
            ? "border-amber-200 bg-amber-50"
            : "border-gray-100 bg-gray-50 hover:bg-white"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
            rankStyle || "bg-gray-300"
          }`}
        >
          {rank}
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-2xl shrink-0">
          {religion.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{religion.name}</p>
          <p className="text-xs text-gray-500 truncate">
            教祖: {religion.founderName} | Lv.{religion.level}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-purple-600 text-sm">{VALUE_DISPLAY[sortKey]}</p>
        </div>
      </div>
    </Link>
  );
}
