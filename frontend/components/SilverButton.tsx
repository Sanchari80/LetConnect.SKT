"use client";
import React from "react";

interface SilverButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function SilverButton({
  children,
  onClick,
  type = "button",
}: SilverButtonProps) {
  const playSound = () => {
    try {
      const audio = new Audio("/click.mp3"); // ✅ Sound.tsx এর মতো কাজ করবে
      audio.play().catch((err) => console.error("❌ Sound error:", err));
    } catch (err) {
      console.error("❌ Audio init error:", err);
    }

    if (onClick) onClick();
  };

  return (
    <button
      onClick={playSound}
      type={type}
      className={`
        relative px-8 py-3
        rounded-full
        text-sm tracking-wider font-light italic
        text-white
        transition-transform duration-300
        hover:scale-105 active:scale-95
        focus:outline-none
        overflow-hidden
        shadow-[0_0_25px_rgba(192,192,255,0.8)]
        bg-gradient-to-r from-[#e0f7fa] via-[#cfd8dc] to-[#b0bec5]
      `}
    >
      {/* Bubble / water drop effect */}
      <span
        className="absolute inset-0 rounded-full
                   bg-gradient-to-r from-[#ffffff80] via-[#e0f7fa80] to-[#cfd8dc80]
                   animate-pulse opacity-50"
      ></span>

      {/* Glitch effect wrapper */}
      <span
        className="relative glitch-text"
        data-text={children}
      >
        {children}
      </span>
    </button>
  );
}