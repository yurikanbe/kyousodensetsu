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
import Avatar from "@/components/Avatar";

const ROLE_COLOR: Record<string, string> = {
  教祖: "text-stone-900 font-bold",
  副教祖: "text-stone-700",
  信者: "text-stone-500",
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
    if (offeringAmount > user.coins) return;
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
      <div className="flex items-center justify-center py-20 text-stone-400">
        <p className="text-sm tracking-widest">読み込み中...</p>
      </div>
    );
  }

  const levelPercent = Math.min(((religion.level % 10) / 10) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-stone-900 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/10 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {religion.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-wide">{religion.name}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-stone-400 tracking-wide">
              <span>{religion.memberCount.toLocaleString()} 人</span>
              <span>{religion.scriptureCount} 経典</span>
              <span>{religion.hymnCount} 賛歌</span>
              <span>Lv.{religion.level}</span>
            </div>
          </div>
          <div className="shrink-0">
            {isJoined ? (
              <button
                onClick={handleLeave}
                className="px-4 py-2 border border-white/30 hover:bg-white/10 text-white text-xs font-medium tracking-wide transition-colors"
              >
                棄教する
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-2 bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold tracking-wide transition-colors"
              >
                入信する
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">レベル進捗</p>
            <div className="w-full bg-stone-100 h-1.5 mb-1">
              <div
                className="bg-stone-900 h-1.5 transition-all"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 text-right">
              {religion.level * 120} / {(religion.level + 1) * 120} XP
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">教義</p>
            <p className="text-stone-800 text-sm leading-relaxed border-l-2 border-stone-900 pl-4">
              {religion.doctrine}
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">アクション</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/religion/${id}/assembly`}>
                <button className="w-full flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors">
                  <span className="text-xs font-medium text-stone-700 tracking-wide">集会に参加</span>
                </button>
              </Link>
              <button
                onClick={() => {
                  setOfferingAmount(Math.min(100, user?.coins ?? 0));
                  setShowOfferingModal(true);
                }}
                className="w-full flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors"
              >
                <span className="text-xs font-medium text-stone-700 tracking-wide">お布施する</span>
              </button>
              <button className="w-full flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors">
                <span className="text-xs font-medium text-stone-700 tracking-wide">経典を読む</span>
              </button>
              <button className="w-full flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors">
                <span className="text-xs font-medium text-stone-700 tracking-wide">賛歌を歌う</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {missions.length > 0 && (
            <div className="bg-white border border-stone-200 p-4">
              <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">今日のミッション</p>
              <div className="space-y-2">
                {missions.slice(0, 3).map((mission) => {
                  const label = mission.label || mission.title || "ミッション";
                  const rewardText = mission.rewards?.length
                    ? mission.rewards
                        .map((r) => {
                          if (r.type === "contrib") return `貢献+${r.amount ?? 0}`;
                          if (r.type === "xp") return `XP+${r.amount ?? 0}`;
                          if (r.type === "coin") return `コイン+${r.amount ?? 0}`;
                          if (r.type === "title") return "称号";
                          if (r.type === "frame") return "フレーム";
                          if (r.type === "appear_today") return "達成者に掲載";
                          return r.type;
                        })
                        .join(" / ")
                    : mission.reward != null
                      ? `報酬: ${mission.reward} コイン`
                      : null;
                  return (
                    <div
                      key={mission.id}
                      className={`p-3 border ${
                        mission.completed ? "bg-stone-50 border-stone-300" : "bg-white border-stone-200"
                      }`}
                    >
                      <p className={`text-sm font-medium ${mission.completed ? "line-through text-stone-400" : "text-stone-800"}`}>
                        {label}
                      </p>
                      {rewardText && (
                        <p className="text-xs text-stone-500 mt-1">{rewardText}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-3">主要メンバー</p>
            {members.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-2">まだメンバーがいません</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar src={member.avatarIcon} name={member.displayName} size="xs" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">{member.displayName}</p>
                      <p className={`text-xs ${ROLE_COLOR[member.role]}`}>
                        {member.role} · Lv.{member.level}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-stone-900 mb-1 tracking-wide">お布施する</h3>
            <p className="text-xs text-stone-500 mb-5">{religion.name} への信仰を示しましょう</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-stone-700 mb-2 tracking-wide">金額（コイン）</label>
              <input
                type="number"
                value={offeringAmount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  const maxCoins = user?.coins ?? 0;
                  if (Number.isNaN(next)) {
                    setOfferingAmount(0);
                    return;
                  }
                  setOfferingAmount(Math.min(Math.max(0, next), maxCoins));
                }}
                min={1}
                max={user?.coins ?? 0}
                className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-400"
              />
              <p className="text-xs text-stone-400 mt-1">所持コイン: {user?.coins.toLocaleString()}</p>
              {(user?.coins ?? 0) <= 0 && (
                <p className="text-xs text-red-600 mt-1">所持コインがないため、お布施できません</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfferingModal(false)}
                className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleOffering}
                disabled={!user || offeringAmount <= 0 || offeringAmount > user.coins}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
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
