"use client";

import React, { useState } from "react";
import api from "../utils/api"; // ✅ use shared axios instance

interface Props {
  refreshFeed: () => void;
}

const PostForm: React.FC<Props> = ({ refreshFeed }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [anonymous, setAnonymous] = useState(false); // ✅ নতুন state
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !images && !video) return;

    const formData = new FormData();
    formData.append("content", text); // ✅ backend expects "content"

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("image", file);
      });
    }

    if (video) {
      formData.append("video", video);
    }

    // ✅ Anonymous flag পাঠানো হবে
    formData.append("anonymous", String(anonymous));

    try {
      setLoading(true);
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setText("");
      setImages(null);
      setVideo(null);
      setAnonymous(false);
      refreshFeed(); // reload feed after new post
    } catch (err: any) {
      console.error("❌ Post create error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="post-form border rounded p-4 mb-6 shadow"
    >
      <h2 className="text-lg font-bold mb-2">Create a new Status</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border rounded p-2 mb-2"
      />

      <div className="flex flex-col gap-2 mb-2">
        <label>
          Upload Images:
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(e.target.files)}
          />
        </label>

        <label>
          Upload Video:
          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setVideo(e.target.files ? e.target.files[0] : null)
            }
          />
        </label>

        {/* ✅ Anonymous checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Post as Anonymous
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default PostForm;