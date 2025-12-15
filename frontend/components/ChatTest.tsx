"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function ChatTest() {
  useEffect(() => {
    const socket = io("http://192.168.0.104:4000"); // ✅ তোমার backend URL

    socket.on("connect", () => {
      console.log("✅ Connected to backend:", socket.id);
      socket.emit("sendMessage", "Hello from frontend!");
    });

    socket.on("receiveMessage", (msg) => {
      console.log("📩 Message received:", msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1 className="text-xl font-bold">Chat Test Running...</h1>;
}