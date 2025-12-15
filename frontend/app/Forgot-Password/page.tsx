"use client";
import { useState } from "react";
import api from "../../utils/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "✅ Reset link sent to your email");
    } catch (err: any) {
      console.error("❌ Forgot password error:", err.response?.data || err.message);
      setMessage(`❌ Error: ${err.response?.data?.error || "Failed to send reset link"}`);
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
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 py-2 rounded">
          Send Reset Link
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}