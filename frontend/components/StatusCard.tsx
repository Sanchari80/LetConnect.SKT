"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api"; // ✅ shared axios instance

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

interface Props {
  status: Status;
  refreshFeed: () => void;
}

const StatusCard: React.FC<Props> = ({ status, refreshFeed }) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    try {
      await api.post(`/posts/${status._id}/like`);
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Like error:", err.response?.data || err.message);
    }
  };

  const handleShare = async () => {
    try {
      await api.post(`/posts/${status._id}/share`);
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Share error:", err.response?.data || err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/posts/${status._id}/comment`, { text: commentText });
      setCommentText("");
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Comment error:", err.response?.data || err.message);
    }
  };

  const getMediaURL = (path: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
    return `${base}${path}`;
  };

  return (
    <div className="status-card border rounded p-4 mb-6 shadow bg-gray-800 text-white">
      {/* Header */}
      <div className="status-header flex justify-between mb-2">
        {status.anonymous ? (
          <strong className="text-gray-400">Anonymous</strong>
        ) : (
          <button
            onClick={() => router.push(`/profile/${status.owner?._id}`)}
            className="font-bold text-purple-400 hover:underline"
          >
            {status.owner?.username}
          </button>
        )}
        <span className="text-sm text-gray-400">
          {new Date(status.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Text */}
      <p className="mb-2">{status.content}</p>

      {/* Images */}
      {status.image?.map((img, idx) => (
        <img
          key={idx}
          src={getMediaURL(img)}
          alt="status"
          className="status-image w-full rounded mb-2"
        />
      ))}

      {/* Video */}
      {status.video && (
        <video
          src={getMediaURL(status.video)}
          controls
          className="status-video w-full rounded mb-2"
        />
      )}

      {/* Actions */}
      <div className="status-actions flex gap-4 mb-2">
        <button
          onClick={handleLike}
          className="hover:text-purple-400 transition"
        >
          👍 Like ({status.likes?.length || 0})
        </button>
        <button
          onClick={handleShare}
          className="hover:text-green-400 transition"
        >
          🔄 Share ({status.shares?.length || 0})
        </button>
      </div>

      {/* Comment box */}
      <div className="comment-box flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-grow border rounded p-2 bg-gray-700 text-white"
        />
        <button
          onClick={handleComment}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Post
        </button>
      </div>

      {/* Comments */}
      <div className="comments space-y-1">
        {status.comments?.map((c, idx) => (
          <p key={idx} className="text-sm">
            <strong>{c.user?.name || "Anonymous"}:</strong> {c.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatusCard;