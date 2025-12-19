"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import SilverButton from "@/components/SilverButton";

const getMediaURL = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
  return `${base}${path}`;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [cv, setCv] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const resUser = await api.get("/profile/me");
      setUser(resUser.data);

      const resCv = await api.get("/cv/my-cv");
      setCv(resCv.data.cv);

      const resStatuses = await api.get("/status/my-statuses");
      setStatuses(resStatuses.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.clear();
        router.push("/login");
      } else {
        console.error("❌ Profile fetch error:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [router]);

  const handleProfileUpload = async () => {
    if (!profileFile) return;
    const formData = new FormData();
    formData.append("profileImage", profileFile);
    await api.post("/profile/upload-image", formData);
    alert("✅ Profile picture updated!");
    fetchProfile();
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    const formData = new FormData();
    formData.append("cv", cvFile);
    await api.post("/cv/upload", formData);
    alert("✅ CV uploaded!");
    fetchProfile();
  };

  if (loading) return <p className="text-center text-gray-400">⏳ Loading profile...</p>;
  if (!user) return <p className="text-center text-red-400">❌ No profile data found</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold">LetConnect</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
          />
          <button onClick={() => alert("🔔 Notifications clicked!")} className="relative">
            <span className="text-2xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1 rounded-full">3</span>
          </button>
        </div>
      </header>

      <div className="px-6 py-10">
        {/* User Info */}
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md mb-6 text-center">
          <img
            src={user.profilePhotoUrl ? getMediaURL(user.profilePhotoUrl) : "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-500 mx-auto mb-4"
          />
          <p className="mb-2"><strong>Name:</strong> {user.name}</p>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>Role:</strong> {user.role}</p>
          <p className="mb-2"><strong>Contact Number:</strong> {user.contact}</p>

          <div className="mt-4">
            <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
            <SilverButton onClick={handleProfileUpload}>📸 Update Profile Picture</SilverButton>
          </div>

          <div className="flex gap-4 justify-center mt-4">
            <SilverButton onClick={() => alert("LetConnect Request sent!")}>🤝 LetConnect Request</SilverButton>
            <SilverButton onClick={() => router.push(`/chat/${user._id}`)}>💬 Message</SilverButton>
          </div>
        </div>

        {/* CV Section */}
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md mb-6">
          <h2 className="text-xl font-bold mb-4">📄 My CV</h2>
          {cv ? (
            <a href={getMediaURL(cv.file)} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              Download CV
            </a>
          ) : (
            <p className="text-gray-400">No CV uploaded</p>
          )}
          <div className="mt-4">
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
            <SilverButton onClick={handleCvUpload}>📤 Upload CV</SilverButton>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md mb-6">
          <h2 className="text-xl font-bold mb-4">🛠 Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300">
              {user.skills.map((skill: string, i: number) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No skills added</p>
          )}
        </div>

        {/* Statuses Section */}
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">📰 My Posts</h2>
          {statuses.length === 0 ? (
            <p className="text-gray-400">No posts yet</p>
          ) : (
            statuses.map((status) => (
              <div key={status._id} className="border-b border-gray-700 pb-4 mb-4">
                <p>{status.Text}</p>
                {status.Image?.map((img: string, i: number) => (
                  <img key={i} src={getMediaURL(img)} className="w-40 h-40 object-cover rounded mt-2" />
                ))}
                {status.Video && (
                  <video controls src={getMediaURL(status.Video)} className="w-full mt-2 rounded" />
                )}
                <p className="text-sm text-gray-400 mt-2">
                  👍 {status.Likes?.length || 0} Likes · 💬 {status.Comments?.length || 0} Comments
                </p>
              </div>
            ))
          )}
        </div>

        {/* Logout */}
        <div className="mt-6">
          <SilverButton
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
          >
            🔒 Logout
          </SilverButton>
        </div>
      </div>
    </div>
  );
}