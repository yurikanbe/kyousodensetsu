"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { mockReligions } from "@/lib/mockData";

export default function PostComposer() {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [selectedReligion, setSelectedReligion] = useState("");

  if (!user) return null;

  const joinedReligions = mockReligions.filter((r) =>
    user.joinedReligionIds.includes(r.id)
  );

  const handleSubmit = () => {
    if (!text.trim()) return;
    setText("");
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
              value={selectedReligion}
              onChange={(e) => setSelectedReligion(e.target.value)}
              className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="">宗教を選択</option>
              {joinedReligions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || !selectedReligion}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors"
            >
              投稿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
