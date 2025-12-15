"use client";
import { useEffect, useState } from "react";
import api from "../utils/axios"; // ✅ use axios instance

// ✅ Helper for media URLs
const getMediaURL = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  return `${base}${path}`;
};

export default function AdvertiseSection() {
  const [ads, setAds] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        // ✅ backend route is /api/advertise/all
        const res = await api.get("/advertise/all");
        setAds(res.data);
      } catch (err: any) {
        console.error("❌ Advertise fetch error:", err.response?.data || err.message);
      }
    };
    fetchAds();
  }, []);

  return (
    <section className="bg-gray-900 text-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-purple-300">
        📣 Skill Development and Opportunities
      </h2>

      {/* ✅ Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <div
            key={ad._id}
            onClick={() => setSelectedAd(ad)}
            className="cursor-pointer p-4 bg-gray-800 rounded hover:bg-purple-800 transition"
          >
            <h3 className="text-lg font-semibold">{ad.title}</h3>
            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
              {ad.content}
            </p>
          </div>
        ))}
      </div>

      {/* ✅ Selected Ad Details */}
      {selectedAd && (
        <div className="mt-6 p-4 bg-gray-700 rounded">
          <h3 className="text-xl font-bold">{selectedAd.title}</h3>
          <p className="mt-2">{selectedAd.content}</p>
          {selectedAd.image && (
            <img
              src={getMediaURL(selectedAd.image)}
              alt="Ad"
              className="mt-4 rounded shadow-lg"
            />
          )}
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