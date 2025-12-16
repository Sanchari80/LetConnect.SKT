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
      className={`
        relative rounded-full px-8 py-2
        italic text-xs tracking-wider
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400
        text-white font-light
        transition-transform duration-300
        hover:scale-105 active:scale-95
        focus:outline-none
        shadow-[0_0_15px_rgba(128,0,128,0.7)]
        overflow-hidden
      `}
      style={{
        borderImage: "linear-gradient(90deg, silver, purple, #ff00ff, #800080) 1",
        borderWidth: "2px",
        borderStyle: "solid",
      }}
    >
      {/* Glitch effect wrapper */}
      <span className="glitch-text" data-text={children}>
        {children}
      </span>
    </button>
  );
}