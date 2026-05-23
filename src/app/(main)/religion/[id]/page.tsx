"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion, Member, Mission } from "@/types";

const ROLE_COLOR: Record<string, string> = {
  教祖: "text-amber-600",
  副教祖: "text-purple-600",
  信者: "text-gray-600",
};

export default function ReligionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, setUser, addCoins, addXp } = useAuthStore();
  const [religion, setReligion] = useState<Religion | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [offeringAmount, setOfferingAmount] = useState(100);

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

    getDocs(
      query(collection(db, "users"), where("joinedReligionIds", "array-contains", id), limit(5))
    ).then((snap) => {
      setMembers(
        snap.docs.map((d) => ({
          userId: d.id,
          displayName: d.data().displayName,
          avatarIcon: d.data().avatarIcon,
          role: (d.data().foundedReligionIds as string[])?.includes(id) ? "教祖" : "信者",
          level: d.data().level,
        } as Member))
      );
    });

    getDocs(collection(db, `religions/${id}/missions`)).then((snap) => {
      setMissions(
        snap.docs.map((d) => ({ id: d.id, religionId: id, ...d.data() } as Mission))
      );
    });
  }, [id]);

  useEffect(() => {
    if (user) {
      setIsJoined(user.joinedReligionIds.includes(id));
    }
  }, [user, id]);

  const handleJoin = async () => {
    if (!user) return;
    await Promise.all([
      updateDoc(doc(db, "users", user.id), { joinedReligionIds: arrayUnion(id) }),
      updateDoc(doc(db, "religions", id), { memberCount: increment(1) }),
    ]);
    setIsJoined(true);
    setUser({ ...user, joinedReligionIds: [...user.joinedReligionIds, id] });
    setReligion((prev) => prev ? { ...prev, memberCount: prev.memberCount + 1 } : prev);
    addXp(50);
  };

  const handleLeave = async () => {
    if (!user) return;
    await Promise.all([
      updateDoc(doc(db, "users", user.id), { joinedReligionIds: arrayRemove(id) }),
      updateDoc(doc(db, "religions", id), { memberCount: increment(-1) }),
    ]);
    setIsJoined(false);
    setUser({ ...user, joinedReligionIds: user.joinedReligionIds.filter((rid) => rid !== id) });
    setReligion((prev) => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
  };

  const handleOffering = async () => {
    if (!user || offeringAmount <= 0) return;
    await Promise.all([
      updateDoc(doc(db, "users", user.id), { coins: increment(-offeringAmount) }),
      updateDoc(doc(db, "religions", id), { totalOfferings: increment(offeringAmount) }),
    ]);
    addCoins(-offeringAmount);
    addXp(offeringAmount);
    setShowOfferingModal(false);
  };

  if (!religion) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <p>読み込み中...</p>
      </div>
    );
  }

  const levelPercent = Math.min(((religion.level % 10) / 10) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-linear-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-4xl shrink-0">
            {religion.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{religion.name}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-purple-200">
              <span>👥 {religion.memberCount.toLocaleString()}人</span>
              <span>📖 {religion.scriptureCount}経典</span>
              <span>🎵 {religion.hymnCount}賛歌</span>
              <span>👑 Lv.{religion.level}</span>
            </div>
          </div>
          <div className="shrink-0">
            {isJoined ? (
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
              >
                棄教する
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 text-sm font-bold rounded-lg transition-colors"
              >
                入信する
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 mb-2">🏛️ 教祖レベル進捗</h2>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">
              次のレベルまで: {religion.level * 120} / {(religion.level + 1) * 120} XP
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 mb-3">📜 教義</h2>
            <p className="text-gray-700 text-sm leading-relaxed border-l-4 border-purple-400 pl-4">
              {religion.doctrine}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 mb-3">⚡ アクション</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/religion/${id}/assembly`}>
                <button className="w-full flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-colors">
                  <span className="text-2xl">👥</span>
                  <span className="text-sm font-medium text-gray-700">集会に参加</span>
                </button>
              </Link>
              <button
                onClick={() => setShowOfferingModal(true)}
                className="w-full flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl transition-colors"
              >
                <span className="text-2xl">💰</span>
                <span className="text-sm font-medium text-gray-700">お布施する</span>
              </button>
              <button className="w-full flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-colors">
                <span className="text-2xl">📖</span>
                <span className="text-sm font-medium text-gray-700">経典を読む</span>
              </button>
              <button className="w-full flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition-colors">
                <span className="text-2xl">🎵</span>
                <span className="text-sm font-medium text-gray-700">賛歌を歌う</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {missions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-bold text-gray-800 mb-3">📋 今日のミッション</h2>
              <div className="space-y-3">
                {missions.slice(0, 3).map((mission) => (
                  <div
                    key={mission.id}
                    className={`p-3 rounded-lg border ${
                      mission.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className={`text-sm font-medium ${mission.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {mission.completed ? "✅" : "⬜"} {mission.title}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">報酬: 🪙 {mission.reward}コイン</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 mb-3">👥 主要メンバー</h2>
            {members.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">まだメンバーがいません</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg shrink-0">
                      {member.avatarIcon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{member.displayName}</p>
                      <p className={`text-xs ${ROLE_COLOR[member.role]}`}>
                        {member.role} | Lv.{member.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showOfferingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">🪙 お布施する</h3>
            <p className="text-sm text-gray-500 mb-4">{religion.name} への信仰を示しましょう</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
              <input
                type="number"
                value={offeringAmount}
                onChange={(e) => setOfferingAmount(Number(e.target.value))}
                min={1}
                max={user?.coins ?? 0}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-400 mt-1">所持コイン: 🪙 {user?.coins.toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferingModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleOffering}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors"
              >
                お布施する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
