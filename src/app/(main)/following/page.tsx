import Link from "next/link";
import { mockReligions } from "@/lib/mockData";
import { mockUser } from "@/lib/mockData";

export default function FollowingPage() {
  const joinedReligions = mockReligions.filter((r) =>
    mockUser.joinedReligionIds.includes(r.id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">🔥 信仰中の宗教</h1>
      <div className="space-y-3">
        {joinedReligions.map((religion) => (
          <Link key={religion.id} href={`/religion/${religion.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-purple-200 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-3xl shrink-0">
                  {religion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-lg">{religion.name}</p>
                  <p className="text-sm text-gray-500">教祖: {religion.founderName} · Lv.{religion.level}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>👥 {religion.memberCount.toLocaleString()}人</span>
                    <span>🔥 +{religion.weeklyGrowth}人/週</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mb-2">
                    信仰中
                  </div>
                  <Link href={`/religion/${religion.id}/assembly`}>
                    <span className="text-xs text-purple-600 hover:underline">集会へ →</span>
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
