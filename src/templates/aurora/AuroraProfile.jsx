// src/templates/aurora/AuroraProfile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiLock, FiEye, FiEyeOff, FiLogOut, FiCopy, FiCheck,
  FiRefreshCw, FiTrash2, FiKey,
} from "react-icons/fi";

export default function AuroraProfile() {
  const { logout } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#a78bfa" };
  const apiUrl = `https://${childPanel?.domain || "marinepanel.online"}/api/v2`;

  const [profile, setProfile] = useState({
    email: "", balance: 0, createdAt: "", apiKey: null, apiAccessEnabled: false,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showCon, setShowCon]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const [showKey, setShowKey]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
  };

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => setProfile(r.data))
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load profile"))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("Fill all fields");
    if (newPw !== confirmPw) return toast.error("Passwords do not match");
    if (newPw.length < 6) return toast.error("Min 6 characters");

    setSaving(true);
    try {
      await API.put("/users/profile", { currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw });
      toast.success("Password updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
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

  const Field = ({ label, value, icon, type, showState, toggleShow, onChange }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-3.5" style={{ color: "rgba(255,255,255,0.3)" }}>{icon}</span>
        <input
          type={type === "password" ? (showState ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = brand.color)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        {type === "password" && (
          <button type="button" onClick={toggleShow} className="absolute right-4 top-3.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {showState ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        )}
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <AuroraLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </AuroraLayout>
    );
  }

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">

        {/* User card */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: `${brand.color}15`, border: `1px solid ${brand.color}25` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
            style={{ background: `${brand.color}30`, color: brand.color }}
          >
            {profile.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{profile.email}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: brand.color }}>
              Balance: ${Number(profile.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Change password */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="font-bold text-white flex items-center gap-2 text-sm">
            <FiLock size={15} style={{ color: brand.color }} />
            Change Password
          </p>

          <Field label="Current Password" value={currentPw} icon={<FiLock size={15} />} type="password"
            showState={showCur} toggleShow={() => setShowCur((s) => !s)} onChange={setCurrentPw} />
          <Field label="New Password" value={newPw} icon={<FiLock size={15} />} type="password"
            showState={showNew} toggleShow={() => setShowNew((s) => !s)} onChange={setNewPw} />
          <Field label="Confirm Password" value={confirmPw} icon={<FiLock size={15} />} type="password"
            showState={showCon} toggleShow={() => setShowCon((s) => !s)} onChange={setConfirmPw} />

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
              color: "#fff",
              boxShadow: `0 4px 24px ${brand.color}40`,
            }}
          >
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>

        {/* API Access */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-bold text-white flex items-center gap-2 text-sm">
              <FiKey size={15} style={{ color: brand.color }} /> API Access
            </p>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={
                profile.apiAccessEnabled
                  ? { background: "rgba(52,211,153,0.15)", color: "#34d399" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {profile.apiAccessEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Use your API key to integrate programmatically.{" "}
            <a href="/api-access" className="font-bold" style={{ color: brand.color }}>View docs →</a>
          </p>

          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>API Endpoint</p>
            <code className="text-sm break-all font-mono" style={{ color: brand.color }}>{apiUrl}</code>
          </div>

          {profile.apiKey ? (
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="text-sm flex-1 break-all font-mono text-white">
                  {showKey ? profile.apiKey : maskedKey}
                </code>
                <button onClick={() => setShowKey((p) => !p)} className="flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? "#34d399" : "rgba(255,255,255,0.4)" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-4 text-center text-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.35)" }}>
              No API key generated yet.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerateKey}
              disabled={apiLoading}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`, color: "#fff" }}
            >
              <FiRefreshCw size={13} className={apiLoading ? "animate-spin" : ""} />
              {profile.apiKey ? "Regenerate" : "Generate Key"}
            </button>
            {profile.apiKey && (
              <button
                onClick={handleRevokeKey}
                disabled={apiLoading}
                className="flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-xl disabled:opacity-60"
                style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
              >
                <FiTrash2 size={13} /> Revoke
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <FiLogOut size={15} /> Sign Out
        </button>
      </div>
    </AuroraLayout>
  );
      }
