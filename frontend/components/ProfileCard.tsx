"use client";
import { useState } from "react";
import api from "../utils/api"; // ✅ use shared axios instance

export default function ProfileCard({ user, currentUser }: { user: any; currentUser: any }) {
  const [status, setStatus] = useState<string>(user.status || "pending");
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Upload states
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // ✅ Accept request
  const handleAccept = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/conversation/${id}/accept`);
      setStatus("accepted");

      await api.post(`/notifications`, {
        user: user._id,
        type: "request",
        fromUser: currentUser._id,
        message: "accepted your LetConnect request",
      });

      alert("✅ Request accepted!");
    } catch (err: any) {
      console.error("❌ Accept error:", err.response?.data || err.message);
      alert("Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reject request
  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/conversation/${id}/reject`);
      setStatus("rejected");

      await api.post(`/notifications`, {
        user: user._id,
        type: "request",
        fromUser: currentUser._id,
        message: "rejected your LetConnect request",
      });

      alert("❌ Request rejected");
    } catch (err: any) {
      console.error("❌ Reject error:", err.response?.data || err.message);
      alert("Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload profile picture
  const handleProfileUpload = async () => {
    if (!profileFile) return;
    const formData = new FormData();
    formData.append("profileImage", profileFile);
    await api.post(`/profile/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Profile picture updated!");
    window.location.reload();
  };

  // ✅ Upload images
  const handleImageUpload = async () => {
    if (!imageFiles) return;
    const formData = new FormData();
    Array.from(imageFiles).forEach((file) => {
      formData.append("Image", file);
    });
    await api.post(`/status/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Images uploaded!");
    window.location.reload();
  };

  // ✅ Upload video
  const handleVideoUpload = async () => {
    if (!videoFile) return;
    const formData = new FormData();
    formData.append("Video", videoFile);
    await api.post(`/status/upload-video`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Video uploaded!");
    window.location.reload();
  };

  return (
    <div className="bg-gray-800 p-6 rounded shadow-md text-center">
      {/* Profile info */}
      <img
        src={user.profileImage || "/default-avatar.png"}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-gray-500 mx-auto mb-4"
      />
      <h2 className="text-xl font-bold mb-2">{user.name}</h2>
      <p className="text-gray-400 mb-4">Conversation Status: {status}</p>

      {/* Action buttons */}
      {status === "pending" && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleAccept(user.conversationId)}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Accept Request"}
          </button>
          <button
            onClick={() => handleReject(user.conversationId)}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Reject Request"}
          </button>
        </div>
      )}

      {status === "accepted" && (
        <p className="text-green-400 font-semibold mt-4">✅ You can now chat freely!</p>
      )}

      {status === "rejected" && (
        <p className="text-red-400 font-semibold mt-4">❌ Request rejected</p>
      )}

      {/* ✅ Upload section — only if it's your own profile */}
      {currentUser._id === user._id && (
        <div className="mt-6 space-y-4">
          <div>
            <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
            <button onClick={handleProfileUpload} className="bg-purple-600 text-white px-4 py-2 rounded mt-2">
              📸 Upload Profile Picture
            </button>
          </div>

          <div>
            <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)} />
            <button onClick={handleImageUpload} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
              🖼 Upload Images
            </button>
          </div>

          <div>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
            <button onClick={handleVideoUpload} className="bg-red-600 text-white px-4 py-2 rounded mt-2">
              🎥 Upload Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}