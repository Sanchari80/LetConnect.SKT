import { ReactNode } from "react";
import AdvertiseSection from "@/components/AdvertiseSection";

export default function AdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ✅ Skill Development Section */}
      <section className="px-6 py-10 border-b border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-purple-300">
          🎓 Skill Development & Opportunities
        </h1>
        <AdvertiseSection />
      </section>

      {/* ✅ Page Content */}
      <main className="px-6 py-10">{children}</main>
    </div>
  );
}