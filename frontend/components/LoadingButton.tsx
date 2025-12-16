"use client";
import React, { ReactNode } from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children?: ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children = "Wait..",
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        relative px-8 py-3 rounded-full flex items-center justify-center
        transition-transform duration-300
        ${loading ? "cursor-not-allowed opacity-70" : "hover:scale-105"}
        bg-black text-white overflow-hidden
        ${className}
      `}
    >
      {/* Electric glowing capsule border */}
      <span
        className="absolute inset-0 rounded-full border-4 animate-pulse"
        style={{
          borderImage: "linear-gradient(90deg, red, orange, blue, red) 1",
          boxShadow:
            "0 0 10px rgba(255,0,0,0.8), 0 0 20px rgba(255,165,0,0.8), 0 0 30px rgba(0,0,255,0.8)",
        }}
      ></span>

      {/* Glitching italic text */}
      <span
        className="relative italic text-lg tracking-wider glitch-text"
        data-text={children}
      >
        {children}
      </span>

      {/* Spinner when loading */}
      {loading && (
        <span className="absolute left-3 w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
    </button>
  );
};

export default LoadingButton;