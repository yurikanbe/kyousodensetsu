"use client";
import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ref, push, onValue, off, DataSnapshot } from "firebase/database";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { rtdb, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion, ChatMessage } from "@/types";

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

const ROLE_BADGE: Record<string, string> = {
  教祖: "bg-stone-900 text-white",
  副教祖: "bg-stone-100 text-stone-700 border border-stone-300",
  信者: "bg-stone-100 text-stone-600",
};

export default function AssemblyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [religion, setReligion] = useState<Religion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDoc(doc(db, "religions", id)).then((snap) => {
      if (snap.exists()) {
        setReligion({
          id: snap.id,
          ...snap.data(),
          createdAt: (snap.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Religion);
      }
    });

    const messagesRef = ref(rtdb, `chats/${id}/messages`);
    onValue(messagesRef, (snap: DataSnapshot) => {
      if (snap.exists()) {
        const data = snap.val() as Record<string, Record<string, unknown>>;
        const msgs: ChatMessage[] = Object.entries(data).map(([key, v]) => ({
          id: key,
          religionId: v.religionId as string,
          authorId: v.authorId as string,
          authorName: v.authorName as string,
          authorIcon: v.authorIcon as string,
          authorRole: v.authorRole as ChatMessage["authorRole"],
          content: v.content as string,
          createdAt: new Date(v.createdAt as number),
        }));
        setMessages(msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
      } else {
        setMessages([]);
      }
    });

    return () => {
      off(ref(rtdb, `chats/${id}/messages`));
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !user) return;
    push(ref(rtdb, `chats/${id}/messages`), {
      religionId: id,
      authorId: user.id,
      authorName: user.displayName,
      authorIcon: user.avatarIcon,
      authorRole: "信者",
      content: text.trim(),
      createdAt: Date.now(),
    });
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const uniqueParticipants = messages.filter(
    (v, i, a) => a.findIndex((m) => m.authorId === v.authorId) === i
  );

  return (
    <div className="max-w-4xl mx-auto flex gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col bg-white border border-stone-200 overflow-hidden min-w-0">
        <div className="bg-stone-900 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 flex items-center justify-center text-xl shrink-0">
            {religion?.icon ?? "🏛️"}
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">{religion?.name ?? "集会"} — 集会</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              <span className="text-stone-400 text-xs">{uniqueParticipants.length}人が参加中</span>
            </div>
          </div>
          <Link href={`/religion/${id}`} className="ml-auto text-stone-500 hover:text-white text-xs tracking-wide transition-colors">
            ← 戻る
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => {
            const isMe = msg.authorId === user?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-base shrink-0">
                    {msg.authorIcon}
                  </div>
                )}
                <div className={`max-w-xs md:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-stone-800">{msg.authorName}</span>
                      <span className={`text-xs px-1.5 py-0.5 ${ROLE_BADGE[msg.authorRole]}`}>
                        {msg.authorRole}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-stone-400 mt-1">{timeLabel(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center py-12 text-stone-400 text-xs tracking-widest">
              まだメッセージがありません。最初のメッセージを送りましょう。
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-stone-200 p-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="w-52 shrink-0 space-y-4 hidden lg:block">
        <div className="bg-white border border-stone-200 p-4">
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">
            参加者 ({uniqueParticipants.length})
          </p>
          <div className="space-y-2">
            {uniqueParticipants.slice(0, 5).map((msg) => (
              <div key={msg.authorId} className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-sm">
                    {msg.authorIcon}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-900 leading-tight">{msg.authorName}</p>
                  <p className="text-xs text-stone-400">{msg.authorRole}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {religion?.pinnedMessage && (
          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-2">固定メッセージ</p>
            <p className="text-xs text-stone-600 leading-relaxed">{religion.pinnedMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
