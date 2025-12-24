"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const res = await api.get(`/user/search?q=${query}`);
        setResults(res.data);
      } catch (err: any) {
        console.error("❌ Search error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🔍 Search Results for "{query}"</h1>

      {loading && <p className="text-gray-400">⏳ Loading...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-400">No users found.</p>
      )}

      <div className="space-y-4">
        {results.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-4 p-4 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
            onClick={() => router.push(`/profile/${user._id}`)}
          >
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-bold">{user.username}</p>
              <p className="text-sm text-gray-300">{user.profession}</p>
              {user.skills?.length > 0 && (
                <p className="text-xs text-gray-400">
                  Skills: {user.skills.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}