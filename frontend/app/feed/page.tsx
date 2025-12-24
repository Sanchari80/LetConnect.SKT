"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";                // ✅ axios instance
import PostForm from "@/components/PostForm";
import SilverButton from "@/components/SilverButton";

interface Comment {
  user?: { _id: string; name: string };
  text: string;
}

interface Status {
  _id: string;
  owner?: { _id: string; username: string; profileImage?: string }; // ✅ backend থেকে আসবে
  content: string;
  image?: string[];
  video?: string;
  likes?: string[];
  shares?: string[];
  comments?: Comment[];
  anonymous?: boolean; // ✅ নতুন field
  createdAt: string;
}

const FeedPage: React.FC = () => {
  const router = useRouter();
  const [feed, setFeed] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // ✅ use api instance
      const res = await api.get("/posts"); // backend route অনুযায়ী
      const statuses = res.data.posts || res.data;
      setFeed(statuses);
    } catch (err: any) {
      console.error("❌ Feed fetch error:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        router.push("/login");
      } else {
        setError("Failed to load feed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="feed-page p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📢 Status Feed</h1>

      {/* ✅ PostForm for creating new status */}
      <PostForm refreshFeed={fetchFeed} />

      {loading && <p className="text-gray-400">⏳ Loading feed...</p>}
      {error && (
        <div>
          <p className="text-red-400">{error}</p>
          <SilverButton onClick={fetchFeed}>🔄 Retry</SilverButton>
        </div>
      )}

      {!loading && !error && feed.length === 0 && (
        <p className="text-gray-400">No statuses yet.</p>
      )}

      <div className="feed-list space-y-4 mt-4">
        {feed.map((status) => (
          <div
            key={status._id}
            className="status-card border rounded p-4 bg-gray-800 shadow"
          >
            {/* ✅ Anonymous হলে শুধু নাম দেখাবে */}
            {status.anonymous ? (
              <span className="font-bold text-gray-400">Anonymous</span>
            ) : (
              <button
                onClick={() => router.push(`/profile/${status.owner?._id}`)}
                className="font-bold text-purple-400 hover:underline"
              >
                {status.owner?.username}
              </button>
            )}

            <p className="mt-2">{status.content}</p>

            {status.image && status.image.length > 0 && (
              <div className="mt-2">
                {status.image.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="post image"
                    className="rounded mb-2"
                  />
                ))}
              </div>
            )}

            {status.video && (
              <video
                src={status.video}
                controls
                className="rounded mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;