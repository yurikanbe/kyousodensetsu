"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/ranking", label: "ランキング" },
    { href: "/search", label: "探索" },
  ];

  return (
    <header className="bg-purple-600 text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50 shadow-md">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-2xl">🔥</span>
        <span className="font-bold text-lg hidden sm:block">教祖伝説</span>
      </Link>

      <div className="flex-1 max-w-lg">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300">🔍</span>
          <input
            type="text"
            placeholder="宗教・投稿を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-purple-700/60 text-white placeholder-purple-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-white/20 text-white"
                : "text-purple-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link href="/profile">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <span className="text-xl">👤</span>
          </button>
        </Link>
      </div>
    </header>
  );
}
