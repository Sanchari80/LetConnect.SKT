import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext"; // 👈 Context import

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, soundEnabled, toggleSound } = useNotifications();
  const [open, setOpen] = useState(false);

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
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-2 z-50">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold">Notifications</p>
            <button
              onClick={toggleSound}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              {soundEnabled ? "🔊 Mute" : "🔇 Unmute"}
            </button>
          </div>

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
                  <strong>{n.fromUser?.username || "Someone"}</strong>{" "}
                  {n.message}
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