"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";

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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl shrink-0">
          {user.avatarIcon}
        </div>
        <div className="flex-1">
          <textarea
            placeholder="お祈りや啓示を投稿..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full resize-none text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <select
              value={selectedReligionId}
              onChange={(e) => setSelectedReligionId(e.target.value)}
              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="">宗教を選択</option>
              {religions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || !selectedReligionId || isSubmitting}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
