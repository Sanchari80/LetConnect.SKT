"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";                // ✅ axios instance
import StatusCard from "@/components/StatusCard";
import PostForm from "@/components/PostForm";
import SilverButton from "@/components/SilverButton";

interface Comment {
  user?: { _id: string; name: string };
  text: string;
}

interface Status {
  _id: string;
  UserId?: { _id: string; name: string };
  Text: string;
  Image?: string[];
  Video?: string;
  Likes?: string[];
  Shares?: string[];
  Comments?: Comment[];
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
      const res = await api.get("/status");
      // backend consistency: if response is { statuses: [...] }
      const statuses = res.data.statuses || res.data;
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
          <StatusCard key={status._id} status={status} refreshFeed={fetchFeed} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;