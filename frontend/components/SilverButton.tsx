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
      const audio = new Audio("/click.mp3");
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
      className="
        rounded-full
        bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600
        text-black font-bold
        px-6 py-3
        shadow-lg
        transform transition
        hover:scale-110 active:scale-95
        hover:shadow-2xl
        focus:outline-none
      "
    >
      {children}
    </button>
  );
}