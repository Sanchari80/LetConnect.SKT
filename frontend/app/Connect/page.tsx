"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ConnectPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch data
  const fetchData = async () => {
    try {
      const resPending = await axios.get(
        "http://localhost:4000/api/connect/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPending(resPending.data);

      const resConnections = await axios.get(
        "http://localhost:4000/api/connect/my-connections",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnections(resConnections.data);
    } catch (err) {
      console.error("Connect error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
    else setLoading(false);
  }, [token]);

  // ✅ Accept request
  const handleAccept = async (id: string) => {
    await axios.post(
      `http://localhost:4000/api/connect/accept/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchData();
  };

  // ✅ Reject request
  const handleReject = async (id: string) => {
    await axios.post(
      `http://localhost:4000/api/connect/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchData();
  };

  // ✅ Disconnect
  const handleDisconnect = async (id: string) => {
    await axios.delete(`http://localhost:4000/api/connect/disconnect/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  if (loading) return <p className="text-gray-400">⏳ Loading connections...</p>;
  if (!token) return <p className="text-red-400">⚠️ Please login first</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">🔗 Connections</h1>

      {/* Pending Requests */}
      <h2 className="text-xl font-bold mb-4">📩 Pending Requests</h2>
      {pending.length === 0 ? (
        <p className="text-gray-400">No pending requests</p>
      ) : (
        pending.map((req) => (
          <div key={req._id} className="bg-gray-800 p-4 rounded mb-4">
            <p>
              {req.requester?.Name} ({req.requester?.Email})
            </p>
            <button
              onClick={() => handleAccept(req._id)}
              className="bg-green-600 px-3 py-1 rounded mr-2"
            >
              ✅ Accept
            </button>
            <button
              onClick={() => handleReject(req._id)}
              className="bg-red-600 px-3 py-1 rounded"
            >
              ❌ Reject
            </button>
          </div>
        ))
      )}

      {/* My Connections */}
      <h2 className="text-xl font-bold mb-4 mt-6">👥 My Connections</h2>
      {connections.length === 0 ? (
        <p className="text-gray-400">No connections yet</p>
      ) : (
        connections.map((conn) => (
          <div key={conn._id} className="bg-gray-800 p-4 rounded mb-4">
            <p>
              {conn.requester?.Name} ({conn.requester?.Email}) ↔{" "}
              {conn.recipient?.Name} ({conn.recipient?.Email})
            </p>
            <button
              onClick={() => handleDisconnect(conn._id)}
              className="bg-yellow-600 px-3 py-1 rounded mt-2"
            >
              🔌 Disconnect
            </button>
          </div>
        ))
      )}
    </div>
  );
}