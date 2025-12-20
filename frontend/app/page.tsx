"use client";
import React from "react";
import Image from "next/image";
import SilverButton from "../components/SilverButton";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* 🎯 Main Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Title */}
        <h1
          className="
            glitch-title
            text-6xl italic font-extrabold mb-6 text-center
          "
        >
          LetConnect
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-300 mb-10 text-center tracking-wide">
          LetConnect Together and also Grow Together.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <SilverButton onClick={() => (window.location.href = "/signup")}>
            Signup
          </SilverButton>
          <SilverButton onClick={() => (window.location.href = "/login")}>
            Login
          </SilverButton>
        </div>
      </section>

      {/* ✅ Footer with logo above text */}
      <footer className="mt-16 px-6 py-8 flex flex-col items-center bg-gray-800 text-white">
        {/* Logo on top */}
        <Image
          src="/skt-logo.jpg"
          alt="SKT Logo"
          width={80}
          height={80}
          className="mb-3 skt-footer-logo"
        />

        {/* Text below logo */}
        <p className="text-sm italic tracking-widest">
          © 2025 LetConnect.SKT
        </p>
      </footer>
    </div>
  );
}