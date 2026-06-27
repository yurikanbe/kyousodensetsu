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

const RANK_STYLES = ["bg-stone-900", "bg-stone-500", "bg-stone-400"];

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
          <div className="bg-white border border-stone-200 p-4 mb-4">
            <h1 className="text-base font-bold text-stone-900 mb-4 tracking-wide">宗教ランキング</h1>

            <div className="flex gap-2 flex-wrap mb-4">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                    sortKey === key
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sorted.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-sm">まだ宗教がありません</p>
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

        <div className="w-52 shrink-0 hidden lg:block">
          <div className="bg-white border border-stone-200 p-4 mb-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">宗教を探す</p>
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
            />
          </div>

          {trending.length > 0 && (
            <div className="bg-white border border-stone-200 p-4">
              <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">急上昇</p>
              <div className="space-y-3">
                {trending.map((rel, i) => (
                  <Link key={rel.id} href={`/religion/${rel.id}`}>
                    <div className="flex items-start gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                      <span className="text-xs font-bold text-stone-400 w-4">#{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-stone-900 leading-tight">{rel.name}</p>
                        <p className="text-xs text-stone-500">+{rel.weeklyGrowth.toLocaleString()} 今週</p>
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
    totalOfferings: `${religion.totalOfferings.toLocaleString()} コイン`,
    weeklyGrowth: `+${religion.weeklyGrowth.toLocaleString()} 今週`,
  };

  return (
    <Link href={`/religion/${religion.id}`}>
      <div className="flex items-center gap-3 p-3 border border-stone-100 bg-stone-50 hover:bg-white transition-all cursor-pointer">
        <div
          className={`w-7 h-7 flex items-center justify-center text-white font-bold text-xs shrink-0 ${
            rankStyle || "bg-stone-300"
          }`}
        >
          {rank}
        </div>
        <div className="w-9 h-9 bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-700 shrink-0">
          {religion.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 text-sm truncate">{religion.name}</p>
          <p className="text-xs text-stone-500 truncate">
            教祖: {religion.founderName} · Lv.{religion.level}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-stone-900 text-sm">{VALUE_DISPLAY[sortKey]}</p>
        </div>
      </div>
    </Link>
  );
}
