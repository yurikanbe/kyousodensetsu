"use client";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import FeedPost from "@/components/feed/FeedPost";
import PostComposer from "@/components/feed/PostComposer";
import { Post } from "@/types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          hasPrayed: false,
          createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        } as Post))
      );
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PostComposer />
      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">まだ投稿がありません。宗教を創設して最初の啓示を投稿しましょう。</p>
          </div>
        )}
      </div>
    </div>
  );
}
