"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@context/SocketContext";
import api from "@utils/api";

interface Message {
  sender: { name?: string } | string;
  receiver?: { name?: string } | string;
  text: string;
  conversationId: string;
  createdAt?: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();

  // ✅ Universal fallback: if route param missing, try localStorage
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const idFromRoute =
      typeof params === "object" && "id" in params ? (params.id as string) : null;
    const idFromStorage = localStorage.getItem("conversationId");

    if (idFromRoute) {
      setConversationId(idFromRoute);
      localStorage.setItem("conversationId", idFromRoute);
    } else if (idFromStorage) {
      setConversationId(idFromStorage);
      router.replace(`/chat/${idFromStorage}`); // auto‑fix URL
    }
  }, [params, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinRoom", conversationId);

    socket.on("receiveMessage", (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    api
      .get(`/api/chat/${encodeURIComponent(conversationId)}`)
      .then((res) => setMessages(res.data.data))
      .catch((err) =>
        console.error("❌ Fetch error:", err.response?.data || err.message)
      );

    return () => {
      socket.emit("leaveRoom", conversationId);
      socket.off("receiveMessage");
    };
  }, [socket, conversationId]);

  const sendMessage = async () => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const receiverId = localStorage.getItem("receiverId");

      if (!currentUserId || !receiverId || !text.trim() || !conversationId) {
        console.warn("❌ sendMessage blocked:", {
          currentUserId,
          receiverId,
          conversationId,
          text,
        });
        return;
      }

      await api.post("/message/send-message", {
        conversationId,
        senderId: currentUserId,
        receiver: receiverId,
        text,
      });

      setText("");
    } catch (err: any) {
      console.error("❌ Send error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">
        Conversation {conversationId || "❌ Not set"}
      </h1>
      <div className="border p-2 h-96 overflow-y-scroll">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <strong>{typeof m.sender === "string" ? m.sender : m.sender?.name}</strong>
            {m.receiver && (
              <> ➝ <em>{typeof m.receiver === "string" ? m.receiver : m.receiver?.name}</em></>
            )}
            : {m.text}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border flex-1 p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
}