import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// ✅ Context তৈরি (default null)
const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendURL) {
      console.error("❌ Socket backend URL missing (NEXT_PUBLIC_BACKEND_URL)");
      return;
    }

    const newSocket = io(backendURL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚡ Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    console.warn("⚠️ useSocket called outside of SocketProvider");
  }
  return context;
};