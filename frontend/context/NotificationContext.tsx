import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

interface Notification {
  _id: string;
  type: string;
  message: string;
  fromUser?: {
    username: string;
    profileImage?: string;
  };
  post?: {
    content: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refresh: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  refresh: () => {},
  soundEnabled: true,
  toggleSound: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");

      if (res.data.success) {
        const newNotifications: Notification[] = res.data.notifications;

        // ✅ নতুন notification এলে sound বাজবে (যদি mute না থাকে)
        if (newNotifications.length > notifications.length && soundEnabled) {
          const audio = new Audio("/new-notification.mp3"); // public folder path
          audio.play().catch((err) => console.error("Audio play error:", err));
        }

        setNotifications(newNotifications);
      }
    } catch (err) {
      console.error("❌ Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // প্রতি 10s এ check
    return () => clearInterval(interval);
  }, [soundEnabled]); // ✅ notifications dependency বাদ দেওয়া হলো

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refresh: fetchNotifications,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);