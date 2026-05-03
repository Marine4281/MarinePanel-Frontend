// src/templates/aurora/AuroraProfile.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiUser, FiLock, FiSave, FiEye, FiEyeOff } from "react-icons/fi";

export default function AuroraProfile() {
  const { user, updateUser } = useAuth();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#a78bfa" };

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showCur, setShowCur]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showCon, setShowCon]       = useState(false);
  const [saving, setSaving]         = useState(false);

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw)
      return toast.error("Fill all fields");
    if (newPw !== confirmPw)
      return toast.error("Passwords do not match");
    if (newPw.length < 6)
      return toast.error("Min 6 characters");

    setSaving(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      toast.success("Password updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">

        {/* User card */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: `${brand.color}15`,
            border: `1px solid ${brand.color}25`,
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{ background: `${brand.color}30`, color: brand.color }}
          >
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-bold text-white">{user?.email}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-xs mt-1" style={{ color: brand.color }}>
              Balance: ${Number(user?.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Change password */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="font-bold text-white flex items-center gap-2 text-sm">
            <FiLock size={15} style={{ color: brand.color }} />
            Change Password
          </p>

          <Field
            label="Current Password"
            value={currentPw}
            icon={<FiLock size={15} />}
            type="password"
            showState={showCur}
            toggleShow={() => setShowCur((s) => !s)}
            onChange={setCurrentPw}
          />
          <Field
            label="New Password"
            value={newPw}
            icon={<FiLock size={15} />}
            type="password"
            showState={showNew}
            toggleShow={() => setShowNew((s) => !s)}
            onChange={setNewPw}
          />
          <Field
            label="Confirm Password"
            value={confirmPw}
            icon={<FiLock size={15} />}
            type="password"
            showState={showCon}
            toggleShow={() => setShowCon((s) => !s)}
            onChange={setConfirmPw}
          />

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
            <FiSave size={14} />
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>
      </div>
    </AuroraLayout>
  );
}
