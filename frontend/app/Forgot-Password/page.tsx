"use client";
import { useState } from "react";
import api from "@/utils/api";
import LoadingButton from "@/components/LoadingButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "✅ Reset link sent to your email");
    } catch (err: any) {
      console.error("❌ Forgot password error:", err.response?.data || err.message);
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to send reset link"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white bg-gray-900 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-6 text-center">🔑 Forgot Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <LoadingButton
          type="submit"
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded"
        >
          Send Reset Link
        </LoadingButton>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}