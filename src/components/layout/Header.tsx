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
    <header className="bg-stone-950 text-white px-6 py-3 flex items-center gap-6 sticky top-0 z-50 border-b border-stone-800">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-stone-500 font-light tracking-widest text-sm">✦</span>
        <span className="font-bold text-base hidden sm:block tracking-wider">教祖伝説</span>
      </Link>

      <div className="flex-1 max-w-lg">
        <input
          type="text"
          placeholder="宗教・投稿を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900 text-white placeholder-stone-600 border border-stone-800 px-4 py-2 text-sm focus:outline-none focus:border-stone-500"
        />
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-sm tracking-wide transition-colors ${
              pathname === link.href
                ? "text-white border-b border-white"
                : "text-stone-500 hover:text-stone-200"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <button className="text-stone-500 hover:text-white transition-colors text-xs tracking-widest">
          通知
        </button>
        <Link href="/profile" className="text-stone-500 hover:text-white transition-colors text-xs tracking-widest">
          プロフィール
        </Link>
      </div>
    </header>
  );
}
