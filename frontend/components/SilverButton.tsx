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
        bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900
        bg-opacity-70 backdrop-blur-md
        text-black text-sm
        font-light italic
        px-6 py-2
        transition-transform duration-700
        hover:rotate-360
        focus:outline-none
      "
    >
      {children}
    </button>
  );
}