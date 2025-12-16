"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import LoadingButton from "@/components/LoadingButton";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${params.token}`, { newPassword });
      setMessage(res.data.message || "✅ Password reset successful");
      // চাইলে redirect করতে পারো login page এ
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      console.error("❌ Reset password error:", err.response?.data || err.message);
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to reset password"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white bg-gray-900 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6 text-center">🔒 Reset Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <LoadingButton type="submit" loading={loading} className="bg-green-600 hover:bg-green-700 py-2 rounded">
          Reset Password
        </LoadingButton>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}