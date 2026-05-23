import Link from "next/link";

export default function MyReligionsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">🏛️ 創設した宗教</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">🔱</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">まだ宗教を創設していません</h2>
        <p className="text-sm text-gray-500 mb-6">
          あなただけのオリジナル宗教を作り、信者を集めましょう。
        </p>
        <Link href="/create">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            ＋ 新しい宗教を創設する
          </button>
        </Link>
      </div>
    </div>
  );
}
