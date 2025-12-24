"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@utils/api"; // ✅ axios instance with interceptor

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      setMessage("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log("Using API URL:", process.env.NEXT_PUBLIC_API_URL);

      const res = await api.post("/auth/signup", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      const data = res.data;
      console.log("✅ Signup response:", data);

      if (data.success) {
        setMessage("✅ Signup successful! Welcome aboard...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(`❌ Signup failed: ${data.message || "Please try again."}`);
      }
    } catch (err: any) {
      console.error("❌ Signup error:", err.response?.data || err.message);
      setMessage(
        `❌ Signup failed: ${
          err.response?.data?.message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white bg-gray-900 min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Signup</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
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
          {loading ? "Signing up..." : "Signup"}
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