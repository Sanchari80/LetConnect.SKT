"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await api.get(`/user/search?q=${query}`);
      setResults(res.data);
    } catch (err: any) {
      console.error("❌ Search error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="search-bar flex gap-2">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded p-2 text-black"
      />
      <button
        onClick={handleSearch}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        🔍 Search
      </button>

      {/* ✅ Results list */}
      {results.length > 0 && (
        <div className="results bg-gray-800 text-white mt-2 rounded p-2">
          {results.map((user) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => router.push(`/profile/${user._id}`)}
            >
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-8 h-8 rounded-full inline-block mr-2"
              />
              <span className="font-bold">{user.username}</span>
              <p className="text-sm text-gray-400">{user.profession}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;