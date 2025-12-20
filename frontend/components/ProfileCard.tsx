"use client";
import { useState } from "react";
import api from "../utils/api";

interface User {
  _id: string;
  name: string;
  profileImage?: string;
  status?: string;
  conversationId?: string;
}

interface ProfileCardProps {
  user: User;
  currentUser: User;
}

export default function ProfileCard({ user, currentUser }: ProfileCardProps) {
  const [status, setStatus] = useState<string>(user.status || "pending");
  const [loading, setLoading] = useState<boolean>(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState(user.name);
  const [showCustomize, setShowCustomize] = useState(false);

  // ✅ Upload profile picture
  const handleProfileUpload = async () => {
    if (!profileFile) return;
    const formData = new FormData();
    formData.append("profileImage", profileFile);
    await api.post(`/profile/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Profile picture updated!");
  };

  // ✅ Delete profile picture
  const handleDeleteProfilePic = async () => {
    try {
      await api.delete(`/profile/delete-image`);
      alert("🗑 Old profile picture deleted!");
    } catch (err: any) {
      console.error("❌ Delete error:", err.response?.data || err.message);
    }
  };

  // ✅ Save new name
  const handleSaveName = async () => {
    try {
      await api.put(`/profile/update-name`, { name: newName });
      alert("✅ Name updated!");
      setShowCustomize(false);
    } catch (err: any) {
      console.error("❌ Name update error:", err.response?.data || err.message);
    }
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

      {/* ✅ Upload/Delete/Customize/Copy buttons */}
      {currentUser._id === user._id && (
        <div className="mt-6 space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleProfileUpload}
              className="bg-purple-600 text-white px-4 py-2 rounded mt-2"
            >
              📸 Upload New Profile Picture
            </button>
          </div>

          <div>
            <button
              onClick={handleDeleteProfilePic}
              className="bg-red-600 text-white px-4 py-2 rounded mt-2"
            >
              🗑 Delete Current Profile Picture
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowCustomize(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              🎨 Customize Profile
            </button>
          </div>
        </div>
      )}

      {/* ✅ Customize Modal */}
      {showCustomize && (
        <div className="mt-6 bg-gray-700 p-4 rounded shadow-md">
          <h3 className="text-lg font-bold mb-2">Customize Profile</h3>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border p-2 rounded bg-gray-800 text-white w-full mb-2"
          />
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSaveName}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              ✅ Save Name
            </button>
            <button
              onClick={() => setShowCustomize(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-yellow-400">{message}</p>}
    </div>
  );
}