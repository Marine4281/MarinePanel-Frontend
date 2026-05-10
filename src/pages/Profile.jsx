// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Copy, Check, Eye, EyeOff, RefreshCw, Trash2, Lock } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    country: "",
    balance: 0,
    createdAt: "",
    apiKey: null,
    apiAccessEnabled: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // Password change state
  const [pwSection, setPwSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/profile");
        setProfile(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put("/users/profile", {
        phone: profile.phone,
        country: profile.country,
      });
      setProfile((prev) => ({ ...prev, ...res.data }));
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setPwLoading(true);
    try {
      await API.put("/users/profile", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSection(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    setApiLoading(true);
    try {
      const res = await API.post("/users/generate-api-key");
      setProfile((prev) => ({
        ...prev,
        apiKey: res.data.apiKey,
        apiAccessEnabled: true,
      }));
      setShowKey(true);
      toast.success("API key generated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate key");
    } finally {
      setApiLoading(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!window.confirm("Are you sure? This will disable API access immediately.")) return;
    setApiLoading(true);
    try {
      await API.post("/users/revoke-api-key");
      setProfile((prev) => ({
        ...prev,
        apiKey: null,
        apiAccessEnabled: false,
      }));
      setShowKey(false);
      toast.success("API key revoked");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke key");
    } finally {
      setApiLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!profile.apiKey) return;
    navigator.clipboard.writeText(profile.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = profile.apiKey
    ? profile.apiKey.slice(0, 6) + "••••••••••••••••••••" + profile.apiKey.slice(-4)
    : null;

  const displayName = profile.email ? profile.email.split("@")[0] : "User";

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header balance={profile.balance} />

      <main className="flex-grow max-w-3xl mx-auto mt-8 px-4 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6 pb-10 space-y-6">

          {/* ── Profile Top ── */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-orange-500">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-gray-500">User ID: #{user?._id}</p>
              <p className="text-sm text-green-600 mt-1">Active</p>
            </div>
          </div>

          <hr />

          {/* ── Profile Info ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="p-2 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ) : (
                <p className="font-medium">{profile.phone}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Account Type</label>
              <p className="font-medium">User</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Country</label>
              {editMode ? (
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  className="p-2 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              ) : (
                <p className="font-medium">{profile.country}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Joined</label>
              <p className="font-medium">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          {/* ── Edit Profile Actions ── */}
          {editMode && (
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          <hr />

          {/* ── Change Password Section ── */}
          <div>
            <button
              onClick={() => setPwSection((p) => !p)}
              className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition"
            >
              <Lock size={17} />
              {pwSection ? "Hide Password Change" : "Change Password"}
            </button>

            {pwSection && (
              <div className="mt-4 space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                {/* Current Password */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="p-2 pr-10 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="p-2 pr-10 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="p-2 pr-10 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                  className="w-full bg-orange-500 text-white py-2.5 rounded-xl hover:bg-orange-600 transition font-medium disabled:opacity-60"
                >
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
          </div>

          <hr />

          {/* ── API Access Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">API Access</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Use your API key to integrate with Marine Panel.{" "}
                  <a href="/api-docs" className="text-orange-500 hover:underline">
                    View docs →
                  </a>
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  profile.apiAccessEnabled
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {profile.apiAccessEnabled ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3">
              <p className="text-xs text-gray-400 mb-0.5">API Endpoint</p>
              <code className="text-sm text-orange-500 break-all">
                https://marinepanel.online/api/v2
              </code>
            </div>

            {profile.apiKey ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Your API Key</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-gray-800 flex-1 break-all font-mono">
                    {showKey ? profile.apiKey : maskedKey}
                  </code>
                  <button
                    onClick={() => setShowKey((p) => !p)}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={handleCopyKey}
                    className="text-gray-400 hover:text-orange-500 shrink-0 transition"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-4 mb-3 text-center text-gray-400 text-sm">
                No API key generated yet.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleGenerateKey}
                disabled={apiLoading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-60"
              >
                <RefreshCw size={15} className={apiLoading ? "animate-spin" : ""} />
                {profile.apiKey ? "Regenerate Key" : "Generate Key"}
              </button>
              {profile.apiKey && (
                <button
                  onClick={handleRevokeKey}
                  disabled={apiLoading}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl transition disabled:opacity-60"
                >
                  <Trash2 size={15} />
                  Revoke
                </button>
              )}
            </div>
          </div>

          <hr />

          {/* ── Bottom Actions ── */}
          <div className="flex flex-col md:flex-row gap-4">
            {!editMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
