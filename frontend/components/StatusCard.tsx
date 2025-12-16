"use client";

import React, { useState } from "react";
import api from "../utils/api"; // ✅ use shared axios instance

interface Comment {
  user?: { Name: string };
  text: string;
}

interface Status {
  _id: string;
  UserId?: { Name: string };
  Text: string;
  Image?: string[];
  Video?: string;
  Likes?: string[];
  Shares?: string[];
  Comments?: Comment[];
  createdAt: string;
}

interface Props {
  status: Status;
  refreshFeed: () => void;
}

const StatusCard: React.FC<Props> = ({ status, refreshFeed }) => {
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    try {
      await api.post(`/status/${status._id}/like`);
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Like error:", err.response?.data || err.message);
    }
  };

  const handleShare = async () => {
    try {
      await api.post(`/status/${status._id}/share`);
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Share error:", err.response?.data || err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.post(`/status/${status._id}/comment`, { text: commentText });
      setCommentText("");
      refreshFeed();
    } catch (err: any) {
      console.error("❌ Comment error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="status-card border rounded p-4 mb-6 shadow bg-gray-800 text-white">
      {/* Header */}
      <div className="status-header flex justify-between mb-2">
        <strong>{status.UserId?.Name}</strong>
        <span className="text-sm text-gray-400">
          {new Date(status.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Text */}
      <p className="mb-2">{status.Text}</p>

      {/* Images */}
      {status.Image?.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt="status"
          className="status-image w-full rounded mb-2"
        />
      ))}

      {/* Video */}
      {status.Video && (
        <video
          src={status.Video}
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
          👍 Like ({status.Likes?.length || 0})
        </button>
        <button
          onClick={handleShare}
          className="hover:text-green-400 transition"
        >
          🔄 Share ({status.Shares?.length || 0})
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
        {status.Comments?.map((c, idx) => (
          <p key={idx} className="text-sm">
            <strong>{c.user?.Name}:</strong> {c.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatusCard;