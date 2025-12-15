import React, { useState } from "react";
import axios from "axios";

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
    await axios.post(`/api/status/${status._id}/like`, {}, { withCredentials: true });
    refreshFeed();
  };

  const handleShare = async () => {
    await axios.post(`/api/status/${status._id}/share`, {}, { withCredentials: true });
    refreshFeed();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await axios.post(
      `/api/status/${status._id}/comment`,
      { text: commentText },
      { withCredentials: true }
    );
    setCommentText("");
    refreshFeed();
  };

  return (
    <div className="status-card">
      <div className="status-header">
        <strong>{status.UserId?.Name}</strong>
        <span>{new Date(status.createdAt).toLocaleString()}</span>
      </div>

      <p>{status.Text}</p>

      {status.Image?.map((img, idx) => (
        <img key={idx} src={img} alt="status" className="status-image" />
      ))}

      {status.Video && <video src={status.Video} controls className="status-video" />}

      <div className="status-actions">
        <button onClick={handleLike}>👍 Like ({status.Likes?.length || 0})</button>
        <button onClick={handleShare}>🔄 Share ({status.Shares?.length || 0})</button>
      </div>

      <div className="comment-box">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button onClick={handleComment}>Post</button>
      </div>

      <div className="comments">
        {status.Comments?.map((c, idx) => (
          <p key={idx}>
            <strong>{c.user?.Name}:</strong> {c.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatusCard;