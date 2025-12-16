"use client";
import { useEffect, useState } from "react";
import api from "../utils/api"; // ✅ axios instance

// ✅ Helper for media URLs
const getMediaURL = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  return `${base}${path}`;
};

interface Ad {
  _id: string;
  title: string;
  content: string;
  image?: string;
}

export default function AdvertiseSection() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError("");
        // ✅ backend route is /api/advertise/all
        const res = await api.get("/advertise/all");
        setAds(res.data);
      } catch (err: any) {
        console.error("❌ Advertise fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to load advertisements");
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <section className="bg-gray-900 text-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-purple-300">
        📣 Skill Development and Opportunities
      </h2>

      {/* ✅ Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <span className="w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></span>
          <span className="ml-3 italic text-sm text-gray-300">Loading ads...</span>
        </div>
      )}

      {/* ✅ Error message */}
      {error && (
        <p className="text-red-400 italic text-center mb-4">{error}</p>
      )}

      {/* ✅ Ads Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div
              key={ad._id}
              onClick={() => setSelectedAd(ad)}
              className="cursor-pointer p-4 bg-gray-800 rounded hover:bg-purple-800 transition"
            >
              {/* Title always visible */}
              <h3 className="text-lg font-semibold text-purple-300">{ad.title}</h3>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Selected Ad Details */}
      {selectedAd && (
        <div className="mt-6 p-4 bg-gray-700 rounded">
          <h3 className="text-xl font-bold text-purple-200">{selectedAd.title}</h3>
          {selectedAd.image && (
            <img
              src={getMediaURL(selectedAd.image)}
              alt="Ad Poster"
              className="mt-4 w-full h-auto rounded shadow-lg"
            />
          )}
          <p className="mt-2">{selectedAd.content}</p>
          <button
            onClick={() => setSelectedAd(null)}
            className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      )}
    </section>
  );
}