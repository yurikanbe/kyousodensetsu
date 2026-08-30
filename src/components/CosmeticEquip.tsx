"use client";

import { useEffect, useState } from "react";
import {
  equipFrame,
  equipTitle,
  ensureDefaultFrame,
  fetchFrameMasters,
  fetchOwnedFrames,
  fetchOwnedTitles,
  fetchTitleMasters,
  seedCosmeticsMaster,
} from "@/lib/cosmetics";
import { useAuthStore } from "@/store/useAuthStore";
import { FrameMaster, TitleMaster } from "@/types";
import Avatar from "@/components/Avatar";

const RARITY_LABEL: Record<string, string> = {
  common: "コモン",
  rare: "レア",
  epic: "エピック",
};

export default function CosmeticEquip() {
  const { user, setUser } = useAuthStore();
  const [titles, setTitles] = useState<TitleMaster[]>([]);
  const [frames, setFrames] = useState<FrameMaster[]>([]);
  const [ownedTitleIds, setOwnedTitleIds] = useState<Set<string>>(new Set());
  const [ownedFrameIds, setOwnedFrameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [titleMasters, frameMasters, ownedTitles, ownedFrames] = await Promise.all([
      fetchTitleMasters(),
      fetchFrameMasters(),
      fetchOwnedTitles(user.id),
      fetchOwnedFrames(user.id),
    ]);
    setTitles(titleMasters);
    setFrames(frameMasters);
    setOwnedTitleIds(new Set(ownedTitles.map((t) => t.id)));
    setOwnedFrameIds(new Set(ownedFrames.map((f) => f.id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const equippedFrame = frames.find((f) => f.id === user.equippedFrameId);
  const equippedTitle = titles.find((t) => t.id === user.equippedTitleId);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const result = await seedCosmeticsMaster();
      await ensureDefaultFrame(user.id);
      if (!user.equippedFrameId) {
        setUser({ ...user, equippedFrameId: "frame_none" });
      }
      setMessage(
        result.titles + result.frames === 0
          ? "マスタは既に登録済みです（デフォルト枠を確認しました）"
          : `称号 ${result.titles}件・フレーム ${result.frames}件を登録しました`
      );
      await load();
    } catch {
      setMessage("マスタの登録に失敗しました（権限を確認してください）");
    } finally {
      setSeeding(false);
    }
  };

  const handleEquipTitle = async (titleId: string | null) => {
    await equipTitle(user.id, titleId);
    setUser({ ...user, equippedTitleId: titleId });
  };

  const handleEquipFrame = async (frameId: string | null) => {
    await equipFrame(user.id, frameId);
    setUser({ ...user, equippedFrameId: frameId });
  };

  return (
    <div className="bg-white border border-stone-200 p-4 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-stone-400 font-medium tracking-widest uppercase mb-1">
            称号・フレーム
          </p>
          <p className="text-xs text-stone-500">所持している装飾を装備できます</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Avatar
            src={user.avatarIcon}
            name={user.displayName}
            size="md"
            frameCssKey={equippedFrame?.cssKey}
          />
          {equippedTitle && (
            <span className="text-xs text-stone-600 font-medium">{equippedTitle.name}</span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-stone-400 text-center py-4">読み込み中...</p>
      ) : (
        <>
          {(titles.length === 0 || frames.length === 0) && (
            <div className="p-3 bg-stone-50 border border-stone-200 space-y-2">
              <p className="text-xs text-stone-600">
                コスメマスタがまだありません。初期データを Firestore に登録できます。
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs tracking-wide transition-colors"
              >
                {seeding ? "登録中..." : "マスタを初期登録"}
              </button>
            </div>
          )}

          {message && <p className="text-xs text-stone-500">{message}</p>}

          <div>
            <p className="text-xs font-medium text-stone-700 mb-2 tracking-wide">称号</p>
            {titles.length === 0 ? (
              <p className="text-xs text-stone-400">称号マスタがありません</p>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => handleEquipTitle(null)}
                  className={`w-full text-left px-3 py-2 text-xs border transition-colors ${
                    !user.equippedTitleId
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-100 hover:border-stone-300"
                  }`}
                >
                  装備なし
                </button>
                {titles.map((title) => {
                  const owned = ownedTitleIds.has(title.id);
                  const equipped = user.equippedTitleId === title.id;
                  return (
                    <button
                      key={title.id}
                      disabled={!owned}
                      onClick={() => handleEquipTitle(title.id)}
                      className={`w-full text-left px-3 py-2 text-xs border transition-colors disabled:opacity-40 ${
                        equipped
                          ? "border-stone-900 bg-stone-50"
                          : "border-stone-100 hover:border-stone-300"
                      }`}
                    >
                      <span className="font-medium text-stone-900">{title.name}</span>
                      <span className="text-stone-400 ml-2">{RARITY_LABEL[title.rarity]}</span>
                      {!owned && <span className="text-stone-400 ml-2">未所持</span>}
                      {equipped && <span className="text-stone-600 ml-2">装備中</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-stone-700 mb-2 tracking-wide">フレーム</p>
            {frames.length === 0 ? (
              <p className="text-xs text-stone-400">フレームマスタがありません</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {frames.map((frame) => {
                  const owned = ownedFrameIds.has(frame.id);
                  const equipped = user.equippedFrameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      disabled={!owned && frame.id !== "frame_none"}
                      onClick={() => handleEquipFrame(frame.id)}
                      className={`flex items-center gap-2 p-2 border text-left transition-colors disabled:opacity-40 ${
                        equipped
                          ? "border-stone-900 bg-stone-50"
                          : "border-stone-100 hover:border-stone-300"
                      }`}
                    >
                      <Avatar
                        src={user.avatarIcon}
                        name={user.displayName}
                        size="xs"
                        frameCssKey={frame.cssKey}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-900 truncate">{frame.name}</p>
                        <p className="text-xs text-stone-400">
                          {owned || frame.id === "frame_none" ? RARITY_LABEL[frame.rarity] : "未所持"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
