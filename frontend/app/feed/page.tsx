'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import StatusCard from '../../components/StatusCard';
import PostForm from '../../components/PostForm';

interface Comment {
  user?: { _id: string; Name: string };
  text: string;
}

interface Status {
  _id: string;
  UserId?: { _id: string; Name: string };
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

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/status`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setFeed(res.data);
    } catch (err) {
      console.error('❌ Feed fetch error:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load feed. Please try again later.');
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

      {loading && <p className="text-gray-400">Loading feed...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && feed.length === 0 && (
        <p className="text-gray-400">No statuses yet.</p>
      )}

      <div className="feed-list space-y-4 mt-4">
        {feed.map((status) => (
          <StatusCard
            key={status._id}
            status={status}
            refreshFeed={fetchFeed}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;