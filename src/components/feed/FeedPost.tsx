"use client";
import { useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import Avatar from "@/components/Avatar";

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
  啓示: { label: "教祖からの啓示", color: "bg-stone-900 text-white" },
  経典: { label: "新しい経典を公開", color: "bg-stone-100 text-stone-700 border border-stone-300" },
  ミッション達成: { label: "ミッション達成", color: "bg-stone-100 text-stone-700 border border-stone-300" },
  お知らせ: { label: "お知らせ", color: "bg-stone-50 text-stone-600 border border-stone-200" },
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
    <article className="bg-white border border-stone-200 p-5 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar src={post.authorIcon} name={post.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-900 text-sm">{post.authorName}</span>
            <Link href={`/religion/${post.religionId}`}>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer">
                {post.religionName}
              </span>
            </Link>
            <span className={`text-xs px-2 py-0.5 font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      <div className="mt-3 whitespace-pre-wrap text-stone-800 text-sm leading-relaxed">
        {post.type === "経典" && post.scriptureTitle && (
          <div className="mb-2 p-3 bg-stone-50 border border-stone-200 border-l-2 border-l-stone-900">
            <p className="text-xs text-stone-600 font-medium mb-1">{post.scriptureTitle}</p>
          </div>
        )}
        {post.content}
        {post.coinsEarned && (
          <p className="mt-2 text-stone-600 font-medium text-sm">
            {post.coinsEarned}コイン獲得
          </p>
        )}
      </div>

      {post.type === "経典" && (
        <button className="mt-2 text-xs text-stone-500 hover:text-stone-900 tracking-wide transition-colors">
          経典を読む →
        </button>
      )}

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-0.5 flex-wrap">
        <button
          onClick={handlePray}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide transition-colors ${
            hasPrayed
              ? "bg-stone-900 text-white font-medium"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          {prayerCount.toLocaleString()} お祈り
        </button>
        <button
          onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          {post.replyCount} 返信
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
          {post.missionaryCount} 布教
        </button>
        <button
          onClick={() => setShowOffering(!showOffering)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          お布施
        </button>
      </div>

      {showOffering && (
        <div className="mt-3 p-3 bg-stone-50 border border-stone-200">
          <p className="text-xs font-medium text-stone-700 mb-2 tracking-wide">お布施する金額を選んでください</p>
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => handleOffering(amount)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
              >
                {amount} コイン
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
            className="flex-1 border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
          />
          <button
            onClick={() => { setReplyText(""); setShowReply(false); }}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs tracking-wide transition-colors"
          >
            送信
          </button>
        </div>
      )}
    </article>
  );
}
