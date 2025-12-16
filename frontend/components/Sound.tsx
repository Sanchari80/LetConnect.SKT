"use client";
import { useEffect } from "react";

export default function ClickSound() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === "button") {
        try {
          const audio = new Audio("/click.mp3");
          audio.play().catch((err) => console.error("❌ Sound error:", err));
        } catch (err) {
          console.error("❌ Audio init error:", err);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}