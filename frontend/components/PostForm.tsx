"use client";

import React, { useState } from "react";
import axios from "axios";

interface Props {
  refreshFeed: () => void;
}

const PostForm: React.FC<Props> = ({ refreshFeed }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !images && !video) return;

    const formData = new FormData();
    formData.append("Text", text);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("Image", file);
      });
    }

    if (video) {
      formData.append("Video", video);
    }

    try {
      setLoading(true);
      // ✅ Use backend base URL from env
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/status`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setText("");
      setImages(null);
      setVideo(null);
      refreshFeed(); // reload feed after new post
    } catch (err) {
      console.error("❌ Post create error:", err);
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