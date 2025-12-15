"use client";
import "./globals.css";
import { useEffect } from "react";
import { AuthProvider } from "../components/AuthContext";
import LayoutWrapper from "../components/LayoutWrapper";
import { SocketProvider } from "@context/SocketContext"; // ✅ socket context যোগ করা হলো

export const metadata = {
  title: "LetConnect",
  description: "Social platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleClick = () => {
      try {
        const audio = new Audio("/click.mp3");
        audio.play().catch((err) => console.error("❌ Sound error:", err));
      } catch (err) {
        console.error("❌ Audio init error:", err);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white flex flex-col min-h-screen">
        <AuthProvider>
          <SocketProvider>
            <LayoutWrapper>
              {/* ✅ Main content only */}
              <main className="flex-grow">{children}</main>
            </LayoutWrapper>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}