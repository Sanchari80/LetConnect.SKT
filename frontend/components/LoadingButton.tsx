"use client";
import React, { useState } from "react";

interface LoadingButtonProps {
  onClick?: () => Promise<void> | void;
  label?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  label = "SKT",
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (onClick) {
        await onClick();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        relative px-6 sm:px-12 py-3 sm:py-4 rounded-3xl flex items-center justify-center
        transition-transform duration-300
        ${loading ? "cursor-not-allowed opacity-70" : "hover:scale-105"}
        bg-gradient-to-r from-purple-600 to-gray-400
        shadow-[0_0_15px_rgba(156,0,255,0.6)]
      `}
    >
      {loading && (
        <span className="absolute left-3 sm:left-4 w-5 sm:w-6 h-5 sm:h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      <span className="relative italic text-xs sm:text-sm tracking-wider text-white">
        {label}
      </span>
    </button>
  );
};

export default LoadingButton;