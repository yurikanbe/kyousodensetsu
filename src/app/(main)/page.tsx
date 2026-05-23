import FeedPost from "@/components/feed/FeedPost";
import PostComposer from "@/components/feed/PostComposer";
import { mockPosts } from "@/lib/mockData";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PostComposer />
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
