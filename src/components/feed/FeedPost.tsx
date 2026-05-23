"use client";
import { useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

interface FeedPostProps {
  post: Post;
}

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

const POST_TYPE_LABEL: Record<Post["type"], { label: string; color: string }> = {
  啓示: { label: "教祖からの啓示", color: "bg-purple-100 text-purple-700" },
  経典: { label: "新しい経典を公開", color: "bg-blue-100 text-blue-700" },
  ミッション達成: { label: "ミッション達成", color: "bg-green-100 text-green-700" },
  お知らせ: { label: "お知らせ", color: "bg-amber-100 text-amber-700" },
};

export default function FeedPost({ post }: FeedPostProps) {
  const { addCoins, addXp } = useAuthStore();
  const [hasPrayed, setHasPrayed] = useState(post.hasPrayed);
  const [prayerCount, setPrayerCount] = useState(post.prayerCount);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showOffering, setShowOffering] = useState(false);

  const typeInfo = POST_TYPE_LABEL[post.type];

  const handlePray = () => {
    if (hasPrayed) {
      setHasPrayed(false);
      setPrayerCount((c) => c - 1);
    } else {
      setHasPrayed(true);
      setPrayerCount((c) => c + 1);
      addXp(5);
    }
  };

  const handleOffering = (amount: number) => {
    addCoins(-amount);
    addXp(amount * 2);
    setShowOffering(false);
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl shrink-0">
          {post.authorIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{post.authorName}</span>
            <Link href={`/religion/${post.religionId}`}>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-medium hover:bg-purple-700 transition-colors cursor-pointer">
                {post.religionIcon} {post.religionName}
              </span>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {timeAgo(post.createdAt)} · {typeInfo.label}
          </p>
        </div>
      </div>

      <div className="mt-3 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
        {post.type === "経典" && post.scriptureTitle && (
          <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1">📖 {post.scriptureTitle}</p>
          </div>
        )}
        {post.content}
        {post.coinsEarned && (
          <p className="mt-2 text-amber-600 font-semibold text-sm">
            🪙 {post.coinsEarned}コイン獲得！
          </p>
        )}
      </div>

      {post.type === "経典" && (
        <button className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
          📖 経典を読む →
        </button>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1 flex-wrap">
        <button
          onClick={handlePray}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            hasPrayed
              ? "bg-purple-100 text-purple-700 font-semibold"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          🙏 {prayerCount.toLocaleString()} お祈り
        </button>
        <button
          onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          💬 {post.replyCount} 返信
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
          📢 {post.missionaryCount} 布教
        </button>
        <button
          onClick={() => setShowOffering(!showOffering)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          🪙 お布施
        </button>
      </div>

      {showOffering && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm font-semibold text-amber-800 mb-2">お布施する金額を選んでください</p>
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => handleOffering(amount)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                🪙 {amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {showReply && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="返信を入力..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={() => { setReplyText(""); setShowReply(false); }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            送信
          </button>
        </div>
      )}
    </article>
  );
}
