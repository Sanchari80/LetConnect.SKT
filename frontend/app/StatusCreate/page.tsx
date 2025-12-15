"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ redirect করার জন্য
import axios from "axios";

export default function StatusCreate() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("⚠️ Please login first");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("Text", text);
    if (images) Array.from(images).forEach((file) => formData.append("Image", file));
    if (video) formData.append("Video", video);

    try {
      setLoading(true);
      await axios.post("http://localhost:4000/api/status", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Status created!");
      setText("");
      setImages(null);
      setVideo(null);

      // ✅ Redirect to Feed page
      router.push("/Feed");
    } catch (err: any) {
      console.error("❌ Status create error:", err.response?.data || err.message);
      alert("❌ Could not create status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">✍️ Create Status</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 rounded text-black"
          required
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
          className="block"
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
          className="block"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition"
        >
          {loading ? "⏳ Posting..." : "🚀 Post"}
        </button>
      </form>
    </div>
  );
}