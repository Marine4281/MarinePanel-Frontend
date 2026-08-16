// src/templates/pulse/PulseProfile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiLock, FiEye, FiEyeOff, FiLogOut, FiCopy, FiCheck,
  FiRefreshCw, FiTrash2, FiKey,
} from "react-icons/fi";

export default function PulseProfile() {
  const { logout } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#6366f1" };
  const apiUrl = `https://${childPanel?.domain || "marinepanel.online"}/api/v2`;

  const [profile, setProfile] = useState({
    email: "", balance: 0, createdAt: "", apiKey: null, apiAccessEnabled: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [cur, setCur]         = useState("");
  const [nw, setNw]           = useState("");
  const [con, setCon]         = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw]   = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [saving, setSaving]   = useState(false);

  const [showKey, setShowKey]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => setProfile(r.data))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load profile"))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handlePwChange = async () => {
    if (!cur || !nw || !con) return toast.error("All fields required");
    if (nw !== con) return toast.error("Passwords don't match");
    if (nw.length < 6) return toast.error("Min 6 characters");
    setSaving(true);
    try {
      await API.put("/users/profile", { currentPassword: cur, newPassword: nw, confirmPassword: con });
      toast.success("Password updated");
      setCur(""); setNw(""); setCon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
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
    } finally { setApiLoading(false); }
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
    } finally { setApiLoading(false); }
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

  const PwField = ({ label, value, onChange, show, toggle }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors"
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
        />
        <button type="button" onClick={toggle} className="absolute right-3.5 top-3.5 text-gray-300">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <PulseLayout>
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 rounded-full border-4 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </PulseLayout>
    );
  }

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-5">
        {/* User card */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}cc 100%)` }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
            {profile.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="font-black text-white truncate">{profile.email}</p>
            <p className="text-white/70 text-xs">
              Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-white text-sm font-bold mt-1">
              ${Number(profile.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
          <p className="font-black text-gray-800 text-sm flex items-center gap-2">
            <FiLock size={14} style={{ color: brand.color }} />
            Change Password
          </p>
          <PwField label="Current" value={cur} onChange={setCur} show={showCur} toggle={() => setShowCur((s) => !s)} />
          <PwField label="New Password" value={nw} onChange={setNw} show={showNw} toggle={() => setShowNw((s) => !s)} />
          <PwField label="Confirm" value={con} onChange={setCon} show={showCon} toggle={() => setShowCon((s) => !s)} />
          <button
            onClick={handlePwChange}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}
          >
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>

        {/* API Access */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-black text-gray-800 text-sm flex items-center gap-2">
              <FiKey size={14} style={{ color: brand.color }} /> API Access
            </p>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={profile.apiAccessEnabled ? { background: "#dcfce7", color: "#16a34a" } : { background: "#f3f4f6", color: "#9ca3af" }}
            >
              {profile.apiAccessEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Use your API key to integrate programmatically.{" "}
            <a href="/api-access" className="font-bold" style={{ color: brand.color }}>View docs →</a>
          </p>

          <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">API Endpoint</p>
            <code className="text-sm break-all font-mono" style={{ color: brand.color }}>{apiUrl}</code>
          </div>

          {profile.apiKey ? (
            <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="text-sm flex-1 break-all font-mono text-gray-800">
                  {showKey ? profile.apiKey : maskedKey}
                </code>
                <button onClick={() => setShowKey((p) => !p)} className="flex-shrink-0 text-gray-400">
                  {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? "#16a34a" : "#9ca3af" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl px-4 py-4 text-center text-sm text-gray-400 border border-dashed border-gray-200">
              No API key generated yet.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerateKey}
              disabled={apiLoading}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-2xl text-white disabled:opacity-60"
              style={{ background: brand.color }}
            >
              <FiRefreshCw size={13} className={apiLoading ? "animate-spin" : ""} />
              {profile.apiKey ? "Regenerate" : "Generate Key"}
            </button>
            {profile.apiKey && (
              <button
                onClick={handleRevokeKey}
                disabled={apiLoading}
                className="flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-2xl disabled:opacity-60"
                style={{ background: "#fef2f2", color: "#dc2626" }}
              >
                <FiTrash2 size={13} /> Revoke
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-red-500 bg-red-50 border border-red-100"
        >
          <FiLogOut size={15} /> Sign Out
        </button>
      </div>
    </PulseLayout>
  );
}
