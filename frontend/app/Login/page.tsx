"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@utils/api";
import LoadingButton from "@/components/LoadingButton";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ Email: "", Password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.Email.trim() || !formData.Password.trim()) {
      setMessage("❌ All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", formData);
      const data = res.data;

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Yeah! You are back! Login successful! Let's Go...");
        setTimeout(() => router.push("/feed"), 1500);
      } else {
        setMessage(
          data.message ||
            "❌ Login failed. Please check your email and password."
        );
      }
    } catch (err: any) {
      setMessage("❌ Login failed. Please check your email and password.");
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
          value={formData.Email}
          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.Password}
          onChange={(e) =>
            setFormData({ ...formData, Password: e.target.value })
          }
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />

        {/* ✅ Updated to use LoadingButton */}
        <LoadingButton
          type="submit"
          loading={loading}
          className="bg-green-600 hover:bg-green-700 py-2 rounded"
        >
          Login
        </LoadingButton>
      </form>

      <p
        className="mt-4 text-center text-sm text-blue-400 cursor-pointer hover:underline"
        onClick={() => router.push("/forgot-password")}
      >
        Forgot your password?
      </p>

      {message && (
        <p
          className={`mt-6 text-center ${
            message.startsWith("❌") ? "text-red-400" : "text-green-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
