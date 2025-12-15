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
        border border-[1px]
        border-gradient-to-r from-red-600 via-orange-500 to-red-700
        bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300
        italic font-light
        px-8 py-2
        shadow-md
        transition-transform
        hover:scale-105 active:scale-95
        focus:outline-none
      "
      style={{
        borderImage: "linear-gradient(90deg, #ff0000, #ff7f00) 1",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      {children}
    </button>
  );
}