// src/templates/neon/NeonProfile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiLock, FiEye, FiEyeOff, FiLogOut, FiCopy, FiCheck,
  FiRefreshCw, FiTrash2, FiKey, FiMail, FiCalendar,
} from "react-icons/fi";

export default function NeonProfile() {
  const { logout } = useAuth();
  const { childPanel } = useChildPanel();

  const neon = childPanel?.themeColor || "#00ff88";
  const apiUrl = `https://${childPanel?.domain || "marinepanel.online"}/api/v2`;

  const [profile, setProfile] = useState({
    email: "", phone: "", country: "", balance: 0,
    createdAt: "", apiKey: null, apiAccessEnabled: false,
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
    if (!cur || !nw || !con) return toast.error("All fields required");
    if (nw !== con) return toast.error("New passwords do not match");
    if (nw.length < 6) return toast.error("Min 6 characters");
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

  const inputStyle = {
    background: "#1b1b2a", border: `1px solid ${neon}22`, color: "#c4c4e0",
    width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, fontSize: 14, outline: "none",
  };

  const PwField = ({ label, value, onChange, show, toggle }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase tracking-widest" style={{ color: `${neon}55` }}>{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
        <button type="button" onClick={toggle} className="absolute right-4 top-3.5" style={{ color: `${neon}55` }}>
          {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <NeonLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
        </div>
      </NeonLayout>
    );
  }

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-lg">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Account</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Profile</h2>
        </div>

        {/* ID card */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#1b1b2a", border: `1px solid ${neon}25`, boxShadow: `0 0 32px ${neon}0a` }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{ background: `${neon}14`, color: neon, border: `1px solid ${neon}33`, boxShadow: `0 0 16px ${neon}33` }}>
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-black truncate" style={{ color: "#c4c4e0" }}>{displayName}</p>
            <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "#6c6c92" }}>
              <FiMail size={11} className="flex-shrink-0" /> <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "#5c5c82" }}>
              <FiCalendar size={11} className="flex-shrink-0" />
              Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </div>
            <p className="text-sm font-black mt-1" style={{ color: neon, textShadow: `0 0 8px ${neon}66` }}>
              ${Number(profile.balance || 0).toFixed(2)} credits
            </p>
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: neon }}>
            <FiLock size={13} /> Change Password
          </p>
          <PwField label="Current Password" value={cur} onChange={setCur} show={showCur} toggle={() => setShowCur((s) => !s)} />
          <PwField label="New Password" value={nw} onChange={setNw} show={showNw} toggle={() => setShowNw((s) => !s)} />
          <PwField label="Confirm New Password" value={con} onChange={setCon} show={showCon} toggle={() => setShowCon((s) => !s)} />
          <button onClick={handlePwChange} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${neon}cc, ${neon}88)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}>
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>

        {/* API access */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: neon }}>
              <FiKey size={13} /> API Access
            </p>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={
                profile.apiAccessEnabled
                  ? { background: "#0f2a1c", color: "#4ade80", border: "1px solid #16a34a33" }
                  : { background: "#141420", color: "#5c5c82", border: `1px solid ${neon}14` }
              }
            >
              {profile.apiAccessEnabled ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#6c6c92" }}>
            Use your API key to integrate programmatically.{" "}
            <a href="/api-access" className="font-bold hover:underline" style={{ color: neon }}>View docs →</a>
          </p>

          <div className="rounded-xl px-4 py-3" style={{ background: "#141420", border: `1px solid ${neon}14` }}>
            <p className="text-xs mb-0.5" style={{ color: "#5c5c82" }}>API Endpoint</p>
            <code className="text-sm break-all font-mono" style={{ color: neon }}>{apiUrl}</code>
          </div>

          {profile.apiKey ? (
            <div className="rounded-xl px-4 py-3" style={{ background: "#141420", border: `1px solid ${neon}14` }}>
              <p className="text-xs mb-1" style={{ color: "#5c5c82" }}>Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="text-sm flex-1 break-all font-mono" style={{ color: "#c4c4e0" }}>
                  {showKey ? profile.apiKey : maskedKey}
                </code>
                <button onClick={() => setShowKey((p) => !p)} className="flex-shrink-0" style={{ color: "#5c5c82" }}>
                  {showKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? "#4ade80" : "#5c5c82" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-4 text-center text-sm" style={{ background: "#141420", border: `1px dashed ${neon}22`, color: "#5c5c82" }}>
              No API key generated yet.
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleGenerateKey}
              disabled={apiLoading}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
            >
              <FiRefreshCw size={13} className={apiLoading ? "animate-spin" : ""} />
              {profile.apiKey ? "Regenerate" : "Generate Key"}
            </button>
            {profile.apiKey && (
              <button
                onClick={handleRevokeKey}
                disabled={apiLoading}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl disabled:opacity-60"
                style={{ color: "#f87171", background: "#2a1414", border: "1px solid #dc262633" }}
              >
                <FiTrash2 size={13} /> Revoke
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
          <FiLogOut size={14} /> Sign Out
        </button>
      </div>
    </NeonLayout>
  );
}
