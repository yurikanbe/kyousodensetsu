import Link from "next/link";
import { mockReligions } from "@/lib/mockData";

export default function AssemblyListPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">💬 集会一覧</h1>
      <div className="space-y-3">
        {mockReligions.slice(0, 6).map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}/assembly`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl shrink-0">
                {religion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{religion.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 200 + 10)}人オンライン
                  </span>
                </div>
              </div>
              <span className="text-purple-600 text-sm font-medium">参加する →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
