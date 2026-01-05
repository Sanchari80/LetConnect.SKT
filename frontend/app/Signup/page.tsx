"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@utils/api";
import LoadingButton from "@/components/LoadingButton";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.Password.trim() !== formData.confirmPassword.trim()) {
      setMessage("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // ✅ Corrected API path to match backend
      const res = await api.post("/api/auth/signup", {
        Name: formData.Name.trim(),
        Email: formData.Email.trim(),
        Password: formData.Password.trim(),
      });

      const data = res.data;

      if (data.success) {
        setMessage("OMG! You are here ?? Signup successful! Welcome Dear...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(`❌ Signup failed: ${data.message || "Please try again."}`);
      }
    } catch (err: any) {
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
          placeholder="Name"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
          required
          className="border p-2 rounded bg-gray-800 text-white"
        />
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

        {/* ✅ Updated to use LoadingButton */}
        <LoadingButton
          type="submit"
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded"
        >
          Signup
        </LoadingButton>
      </form>

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
