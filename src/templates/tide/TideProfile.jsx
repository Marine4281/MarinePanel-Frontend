// src/templates/tide/TideProfile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiLock, FiEye, FiEyeOff, FiLogOut, FiCopy, FiCheck,
  FiRefreshCw, FiTrash2, FiKey, FiMail, FiCalendar, FiGlobe,
} from "react-icons/fi";

export default function TideProfile() {
  const { logout } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };
  const apiUrl = `https://${childPanel?.domain || "marinepanel.online"}/api/v2`;

  const [profile, setProfile] = useState({
    email: "", phone: "", country: "", balance: 0,
    createdAt: "", apiKey: null, apiAccessEnabled: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [cur, setCur] = useState("");
  const [nw, setNw]   = useState("");
  const [con, setCon] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw]   = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [saving, setSaving]   = useState(false);

  const [showKey, setShowKey]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/users/profile");
        setProfile(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  const handlePwChange = async () => {
    if (!cur || !nw || !con) return toast.error("All password fields are required");
    if (nw !== con) return toast.error("New passwords do not match");
    if (nw.length < 6) return toast.error("New password must be at least 6 characters");
    setSaving(true);
    try {
      await API.put("/users/profile", { currentPassword: cur, newPassword: nw, confirmPassword: con });
      toast.success("Password updated");
      setCur(""); setNw(""); setCon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async () => {
    setApiLoading(true);
    try {
      const res = await API.post("/users/generate-api-key");
      setProfile((p) => ({ ...p, apiKey: res.data.apiKey, apiAccessEnabled: true }));
      setShowKey(true);
      toast.success("API key generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate key");
    } finally {
      setApiLoading(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!window.confirm("Revoke API access? This takes effect immediately.")) return;
    setApiLoading(true);
    try {
      await API.post("/users/revoke-api-key");
      setProfile((p) => ({ ...p, apiKey: null, apiAccessEnabled: false }));
      setShowKey(false);
      toast.success("API key revoked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke key");
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
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 pr-12";

  const PwField = ({ label, value, onChange, show, toggle }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <button type="button" onClick={toggle} className="absolute right-4 top-3.5 text-gray-300">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <TideLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </TideLayout>
    );
  }

  return (
    <TideLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}>
              <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-2xl font-black text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="font-black text-gray-900">{displayName}</p>
                <p className="text-xs text-green-600 font-semibold mt-0.5">Active</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiMail size={12} className="flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiGlobe size={12} className="flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiCalendar size={12} className="flex-shrink-0" />
                  <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-2xl font-black" style={{ color: brand.color }}>
                  ${Number(profile.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <FiLogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"
              style={{ borderLeft: `4px solid ${brand.color}` }}>
              <FiLock size={14} style={{ color: brand.color }} />
              <div>
                <h3 className="font-black text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <PwField label="Current Password" value={cur} onChange={setCur} show={showCur} toggle={() => setShowCur((s) => !s)} />
              <PwField label="New Password" value={nw} onChange={setNw} show={showNw} toggle={() => setShowNw((s) => !s)} />
              <PwField label="Confirm New Password" value={con} onChange={setCon} show={showCon} toggle={() => setShowCon((s) => !s)} />
              <button
                onClick={handlePwChange}
                disabled={saving}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: brand.color, boxShadow: `0 4px 14px ${brand.color}44` }}
              >
                {saving ? "Saving…" : "Update Password"}
              </button>
            </div>
          </div>

          {/* API access */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2"
              style={{ borderLeft: `4px solid ${brand.color}` }}>
              <div className="flex items-center gap-2">
                <FiKey size={14} style={{ color: brand.color }} />
                <div>
                  <h3 className="font-black text-gray-900">API Access</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Use your API key to integrate programmatically.{" "}
                    <a href="/api-access" className="font-semibold hover:underline" style={{ color: brand.color }}>
                      View docs →
                    </a>
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                profile.apiAccessEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}>
                {profile.apiAccessEnabled ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">API Endpoint</p>
                <code className="text-sm break-all font-mono" style={{ color: brand.color }}>{apiUrl}</code>
              </div>

              {profile.apiKey ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Your API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-800 flex-1 break-all font-mono">
                      {showKey ? profile.apiKey : maskedKey}
                    </code>
                    <button onClick={() => setShowKey((p) => !p)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button onClick={handleCopyKey} className="text-gray-400 hover:text-gray-600 flex-shrink-0" style={copied ? { color: "#16a34a" } : {}}>
                      {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-4 text-center text-gray-400 text-sm">
                  No API key generated yet.
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleGenerateKey}
                  disabled={apiLoading}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white disabled:opacity-60"
                  style={{ background: brand.color }}
                >
                  <FiRefreshCw size={14} className={apiLoading ? "animate-spin" : ""} />
                  {profile.apiKey ? "Regenerate Key" : "Generate Key"}
                </button>
                {profile.apiKey && (
                  <button
                    onClick={handleRevokeKey}
                    disabled={apiLoading}
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-red-600 bg-red-50 border border-red-100 disabled:opacity-60"
                  >
                    <FiTrash2 size={14} /> Revoke
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TideLayout>
  );
}
