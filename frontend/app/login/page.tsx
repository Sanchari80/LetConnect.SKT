"use client";

import { useState } from "react";
import api from "@utils/api"; // ✅ uses interceptor with alias

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage("❌ All fields are required");
      setLoading(false);
      return;
    }

    try {
      console.log("Using API URL:", process.env.NEXT_PUBLIC_API_URL);

      const res = await api.post("/auth/login", formData);
      const data = res.data;
      console.log("✅ Login response:", data);

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("✅ Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/feed";
      }, 1500);
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setMessage(
        `❌ Error: ${err.response?.data?.error || err.message || "Login failed"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white bg-gray-900 min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className={`bg-green-600 hover:bg-green-700 text-white py-2 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p
        className="mt-4 text-center text-sm text-blue-400 cursor-pointer hover:underline"
        onClick={() => (window.location.href = "/forgot-password")}
      >
        Forgot your password?
      </p>

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