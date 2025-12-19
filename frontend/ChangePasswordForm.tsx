"use client";

import { useState } from "react";
import api from "./utils/api"; // ✅ সঠিক path

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Not logged in");
      setLoading(false);
      return;
    }

    try {
      const res = await api.put(
        "/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "✅ Password changed successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error("❌ Change password error:", err.response?.data || err.message || err);
      setMessage(`❌ Error: ${err.response?.data?.error || "Password change failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white bg-gray-900 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6 text-center">🔒 Change Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-6 text-center ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}