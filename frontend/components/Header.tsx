"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHydrated(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken ?? null);
  }, []);

  // ✅ Prevent premature render before hydration
  if (!hydrated) return null;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-md text-white">
      {/* ✅ Logo */}
      <h1
        className="text-2xl font-bold cursor-pointer hover:text-purple-400"
        onClick={() => router.push("/")}
      >
        LetConnect
      </h1>

      {/* ✅ Navigation */}
      {token ? (
        <div className="flex items-center gap-6">
          {/* Feed */}
          <button
            onClick={() => router.push("/feed")}
            className="hover:text-purple-400"
          >
            📰 Feed
          </button>

          {/* Notification */}
          <button
            onClick={() => alert("🔔 Notifications clicked!")}
            className="relative hover:text-yellow-400"
          >
            🔔
            <span className="absolute -top-1 -right-2 bg-red-600 text-xs px-1 rounded-full">
              3
            </span>
          </button>

          {/* Profile */}
          <button
            onClick={() => router.push("/profile")}
            className="hover:text-green-400"
          >
            👤 Profile
          </button>

          {/* ✅ Advertise */}
          <button
            onClick={() => router.push("/advertise")}
            className="hover:text-pink-400"
          >
            📣 Advertise
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/signup")}
            className="hover:text-blue-400"
          >
            📝 Signup
          </button>
          <button
            onClick={() => router.push("/login")}
            className="hover:text-blue-400"
          >
            🔐 Login
          </button>
        </div>
      )}
    </header>
  );
}