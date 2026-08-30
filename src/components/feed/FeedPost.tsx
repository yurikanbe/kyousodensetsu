"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post, Reply } from "@/types";
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
  const { user, addCoins, addXp } = useAuthStore();
  const [hasPrayed, setHasPrayed] = useState(post.hasPrayed);
  const [prayerCount, setPrayerCount] = useState(post.prayerCount);
  const [missionaryCount, setMissionaryCount] = useState(post.missionaryCount);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [showOffering, setShowOffering] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "posts", post.id, "prayers", user.id)).then((snap) => {
      setHasPrayed(snap.exists());
    });
  }, [post.id, user]);

  useEffect(() => {
    if (!showReply) return;
    const q = query(collection(db, "posts", post.id, "replies"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setReplies(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Reply))
      );
    });
    return unsubscribe;
  }, [post.id, showReply]);

  const typeInfo = POST_TYPE_LABEL[post.type] ?? {
    label: post.type ?? "投稿",
    color: "bg-stone-50 text-stone-600 border border-stone-200",
  };

  const handlePray = async () => {
    if (!user) return;
    const prayerRef = doc(db, "posts", post.id, "prayers", user.id);
    const postRef = doc(db, "posts", post.id);

    if (hasPrayed) {
      setHasPrayed(false);
      setPrayerCount((c) => c - 1);
      await deleteDoc(prayerRef);
      await updateDoc(postRef, { prayerCount: increment(-1) });
    } else {
      setHasPrayed(true);
      setPrayerCount((c) => c + 1);
      addXp(5);
      await setDoc(prayerRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { prayerCount: increment(1) });
    }
  };

  const handleReplySubmit = async () => {
    if (!user || !replyText.trim()) return;
    setIsReplyLoading(true);
    await addDoc(collection(db, "posts", post.id, "replies"), {
      authorId: user.id,
      authorName: user.displayName,
      authorIcon: user.avatarIcon,
      content: replyText.trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "posts", post.id), { replyCount: increment(1) });
    setReplyText("");
    setIsReplyLoading(false);
  };

  const handleShare = async () => {
    if (!user) return;
    const url = `${window.location.origin}/religion/${post.religionId}`;
    const text = `${post.religionName}の啓示: ${post.content.slice(0, 60)}${post.content.length > 60 ? "…" : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.religionName, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareMessage("リンクをコピーしました");
        setTimeout(() => setShareMessage(""), 2000);
      }
      const missionaryRef = doc(db, "posts", post.id, "missionaries", user.id);
      const snap = await getDoc(missionaryRef);
      if (!snap.exists()) {
        await setDoc(missionaryRef, { createdAt: serverTimestamp() });
        await updateDoc(doc(db, "posts", post.id), { missionaryCount: increment(1) });
        setMissionaryCount((c) => c + 1);
      }
    } catch {
      // 共有がキャンセルされた場合は何もしない
    }
  };

  const handleOffering = async (amount: number) => {
    if (!user || amount <= 0 || user.coins < amount) return;
    await updateDoc(doc(db, "users", user.id), { coins: increment(-amount) });
    await updateDoc(doc(db, "religions", post.religionId), { totalOfferings: increment(amount) });
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
          disabled={!user}
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
        <button
          onClick={handleShare}
          disabled={!user}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          {missionaryCount} 布教
        </button>
        <button
          onClick={() => setShowOffering(!showOffering)}
          disabled={!user}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          お布施
        </button>
      </div>

      {shareMessage && (
        <p className="mt-2 text-xs text-stone-500">{shareMessage}</p>
      )}

      {showOffering && (
        <div className="mt-3 p-3 bg-stone-50 border border-stone-200">
          <p className="text-xs font-medium text-stone-700 mb-2 tracking-wide">お布施する金額を選んでください</p>
          <p className="text-xs text-stone-400 mb-2">所持コイン: {user?.coins.toLocaleString()}</p>
          <div className="flex gap-2 flex-wrap">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => handleOffering(amount)}
                disabled={!user || user.coins < amount}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-medium transition-colors"
              >
                {amount} コイン
              </button>
            ))}
          </div>
        </div>
      )}

      {showReply && (
        <div className="mt-3 space-y-3">
          {replies.length > 0 && (
            <div className="space-y-2 pl-3 border-l border-stone-200">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar src={reply.authorIcon} name={reply.authorName} size="xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-stone-800">{reply.authorName}</span>
                      <span className="text-xs text-stone-400">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-stone-700 mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="返信を入力..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReplySubmit();
                }
              }}
              className="flex-1 border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
            />
            <button
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || isReplyLoading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs tracking-wide transition-colors"
            >
              {isReplyLoading ? "送信中..." : "送信"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
