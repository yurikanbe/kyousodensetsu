"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";
import Avatar from "@/components/Avatar";
import { frameCssKeyFromId } from "@/lib/cosmetics";

export default function PostComposer() {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [selectedReligionId, setSelectedReligionId] = useState("");
  const [religions, setReligions] = useState<Religion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.joinedReligionIds.length === 0) {
      setReligions([]);
      return;
    }
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

  if (!user) return null;

  const handleSubmit = async () => {
    if (!text.trim() || !selectedReligionId || isSubmitting) return;
    const religion = religions.find((r) => r.id === selectedReligionId);
    if (!religion) return;

    setIsSubmitting(true);
    await addDoc(collection(db, "posts"), {
      religionId: selectedReligionId,
      religionName: religion.name,
      religionIcon: religion.icon,
      authorId: user.id,
      authorName: user.displayName,
      authorIcon: user.avatarIcon,
      authorRole: user.foundedReligionIds?.includes(selectedReligionId) ? "教祖" : "信者",
      type: "啓示",
      content: text.trim(),
      prayerCount: 0,
      replyCount: 0,
      missionaryCount: 0,
      createdAt: serverTimestamp(),
    });
    setText("");
    setSelectedReligionId("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border border-stone-200 p-4">
      <div className="flex gap-3">
        <Avatar
          src={user.avatarIcon}
          name={user.displayName}
          size="sm"
          frameCssKey={frameCssKeyFromId(user.equippedFrameId)}
        />
        <div className="flex-1">
          <textarea
            placeholder="お祈りや啓示を投稿..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full resize-none text-stone-900 placeholder-stone-400 text-sm focus:outline-none"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
            <select
              value={selectedReligionId}
              onChange={(e) => setSelectedReligionId(e.target.value)}
              className="text-xs text-stone-600 border border-stone-200 px-2 py-1 focus:outline-none focus:border-stone-400 bg-white"
            >
              <option value="">宗教を選択</option>
              {religions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || !selectedReligionId || isSubmitting}
              className="px-5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium tracking-wide transition-colors"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
