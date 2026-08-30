"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Religion } from "@/types";
import Avatar from "@/components/Avatar";
import { frameCssKeyFromId } from "@/lib/cosmetics";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [joinedReligions, setJoinedReligions] = useState<Religion[]>([]);

  useEffect(() => {
    if (!user) {
      setJoinedReligions([]);
      return;
    }
    const followedOnlyIds = user.joinedReligionIds.filter(
      (id) => !user.foundedReligionIds.includes(id)
    );
    if (followedOnlyIds.length === 0) {
      setJoinedReligions([]);
      return;
    }
    Promise.all(
      followedOnlyIds.map((id) => getDoc(doc(db, "religions", id)))
    ).then((snaps) => {
      setJoinedReligions(
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

  const navItems = [
    { href: "/assembly", label: "集会" },
    { href: "/following", label: "信仰中の宗教" },
    { href: "/my-religions", label: "創設した宗教" },
    { href: "/ranking", label: "ランキング" },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-hide bg-white border-r border-stone-200 flex flex-col">
      <div className="p-4">
        <Link href="/create" className="block w-full">
          <button className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 px-4 text-xs tracking-widest transition-colors">
            ＋ 新しい宗教を創設
          </button>
        </Link>
      </div>

      <nav className="px-3 pb-4">
        <p className="text-xs text-stone-400 font-medium px-3 py-2 tracking-widest uppercase">メニュー</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 transition-colors cursor-pointer ${
                pathname === item.href
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span className="text-sm">{item.label}</span>
            </div>
          </Link>
        ))}

        {joinedReligions.length > 0 && (
          <>
            <p className="text-xs text-stone-400 font-medium px-3 py-2 mt-4 tracking-widest uppercase">信仰中</p>
            {joinedReligions.map((rel) => (
              <Link key={rel.id} href={`/religion/${rel.id}`}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 transition-colors cursor-pointer ${
                    pathname === `/religion/${rel.id}`
                      ? "bg-stone-100 text-stone-900 font-semibold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <div className="w-5 h-5 bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-700 shrink-0">
                    {rel.name.charAt(0)}
                  </div>
                  <span className="text-sm truncate">{rel.name}</span>
                </div>
              </Link>
            ))}
          </>
        )}
      </nav>

      {user && (
        <div className="mt-auto p-4 border-t border-stone-200">
          <Link href="/profile">
            <div className="flex items-center gap-3 p-2 hover:bg-stone-50 cursor-pointer transition-colors">
              <Avatar
                src={user.avatarIcon}
                name={user.displayName}
                size="sm"
                frameCssKey={frameCssKeyFromId(user.equippedFrameId)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{user.displayName}</p>
                <p className="text-xs text-stone-400">Lv.{user.level}</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
