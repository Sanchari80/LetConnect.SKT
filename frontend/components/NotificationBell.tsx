import React, { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  _id: string;
  type: string;
  message: string;
  fromUser?: { Name: string; ProfileImage?: string };
  post?: { content: string };
  isRead: boolean;
  createdAt: string;
}

const NotificationBell: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${userId}`
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("❌ Notification fetch error:", err);
      }
    };
    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-purple-900 text-silver hover:scale-110 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-2 z-50">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-2 mb-1 rounded ${
                  n.isRead ? "bg-gray-100" : "bg-purple-100"
                }`}
              >
                <p className="text-sm">
                  <strong>{n.fromUser?.Name || "Someone"}</strong> {n.message}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;