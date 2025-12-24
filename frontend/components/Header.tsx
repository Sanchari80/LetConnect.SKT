"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function Header() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    setHydrated(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken ?? null);
  }, []);

  // ✅ Prevent premature render before hydration
  if (!hydrated) return null;

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get(`/user/search?q=${search}`);
      setResults(res.data);
    } catch (err: any) {
      console.error("❌ Search error:", err.response?.data || err.message);
    }
  };

  return (
    <header className="flex flex-col gap-2 px-6 py-4 bg-gray-800 shadow-md text-white">
      {/* ✅ Top bar */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-purple-400"
          onClick={() => router.push("/")}
        >
          LetConnect
        </h1>

        {/* Navigation */}
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

            {/* Advertise */}
            <button
              onClick={() => router.push("/advertise")}
              className="hover:text-pink-400"
            >
              📣 Advertise
            </button>

            {/* Search box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1 rounded bg-gray-700 text-white focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700"
              >
                Go
              </button>
            </div>
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
      </div>

      {/* ✅ Search results */}
      {results.length > 0 && (
        <div className="bg-gray-700 rounded p-2 mt-2">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-600 cursor-pointer"
              onClick={() => router.push(`/profile/${user._id}`)}
            >
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-bold">{user.username}</p>
                <p className="text-sm text-gray-300">{user.profession}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}