"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    { href: "/assembly", label: "集会", icon: "💬" },
    { href: "/following", label: "信仰中の宗教", icon: "🔥" },
    { href: "/my-religions", label: "創設した宗教", icon: "🏛️" },
    { href: "/ranking", label: "ランキング", icon: "🏆" },
  ];

  const joinedReligions = [
    { id: "religion-1", name: "朝ごはんはパン教", icon: "🍞" },
    { id: "religion-2", name: "コーヒーは至高教", icon: "☕" },
    { id: "religion-3", name: "昼寝は正義教", icon: "😮" },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-hide bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Link href="/create" className="block w-full">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            ＋ 新しい宗教を創設
          </button>
        </Link>
      </div>

      <nav className="px-3 pb-4">
        <p className="text-xs text-gray-400 font-semibold px-3 py-2">メニュー</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer ${
                pathname === item.href
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </div>
          </Link>
        ))}

        <p className="text-xs text-gray-400 font-semibold px-3 py-2 mt-4">信仰中</p>
        {joinedReligions.map((rel) => (
          <Link key={rel.id} href={`/religion/${rel.id}`}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer ${
                pathname === `/religion/${rel.id}`
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{rel.icon}</span>
              <span className="text-sm truncate">{rel.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="mt-auto p-4 border-t border-gray-200">
          <Link href="/profile">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                {user.avatarIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-500">Lv.{user.level}</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
