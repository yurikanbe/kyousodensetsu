"use client";
import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { mockReligions, mockChatMessages } from "@/lib/mockData";
import { useAuthStore } from "@/store/useAuthStore";
import { ChatMessage } from "@/types";

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

const ROLE_BADGE: Record<string, string> = {
  教祖: "bg-amber-100 text-amber-700",
  副教祖: "bg-purple-100 text-purple-700",
  信者: "bg-gray-100 text-gray-600",
};

export default function AssemblyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const religion = mockReligions.find((r) => r.id === id) ?? mockReligions[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !user) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      religionId: id,
      authorId: user.id,
      authorName: user.displayName,
      authorIcon: user.avatarIcon,
      authorRole: "信者",
      content: text.trim(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onlineCount = 128;

  return (
    <div className="max-w-4xl mx-auto flex gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden min-w-0">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {religion.icon}
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">{religion.name} — 集会</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-purple-200 text-xs">{onlineCount}人がオンライン</span>
            </div>
          </div>
          <Link href={`/religion/${id}`} className="ml-auto text-purple-200 hover:text-white text-sm">
            ← 戻る
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => {
            const isMe = msg.authorId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg shrink-0">
                    {msg.authorIcon}
                  </div>
                )}
                <div className={`max-w-xs md:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-gray-800">{msg.authorName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_BADGE[msg.authorRole]}`}>
                        {msg.authorRole}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-purple-600 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{timeLabel(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 p-3 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="w-56 shrink-0 space-y-4 hidden lg:block">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">
            👥 参加者 ({onlineCount})
          </h3>
          <div className="space-y-2">
            {messages
              .filter((v, i, a) => a.findIndex((m) => m.authorId === v.authorId) === i)
              .slice(0, 5)
              .map((msg) => (
                <div key={msg.authorId} className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">
                      {msg.authorIcon}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 leading-tight">{msg.authorName}</p>
                    <p className="text-xs text-gray-400">{msg.authorRole}</p>
                  </div>
                </div>
              ))}
            <p className="text-xs text-gray-400 text-center pt-1">+{onlineCount - 5}人</p>
          </div>
        </div>

        {religion.pinnedMessage && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-1">
              📌 固定メッセージ
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">{religion.pinnedMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
