// src/templates/pulse/PulseProfile.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiLogOut } from "react-icons/fi";

export default function PulseProfile() {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();

  const [cur, setCur]         = useState("");
  const [nw, setNw]           = useState("");
  const [con, setCon]         = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw]   = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [saving, setSaving]   = useState(false);

  const brand = { color: childPanel?.themeColor || "#6366f1" };

  const handlePwChange = async () => {
    if (!cur || !nw || !con) return toast.error("All fields required");
    if (nw !== con) return toast.error("Passwords don't match");
    if (nw.length < 6) return toast.error("Min 6 characters");
    setSaving(true);
    try {
      await API.put("/users/change-password", { currentPassword: cur, newPassword: nw });
      toast.success("Password updated");
      setCur(""); setNw(""); setCon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

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

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-5">
        {/* User card */}
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}cc 100%)` }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black text-white">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-black text-white">{user?.email}</p>
            <p className="text-white/70 text-xs">
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-white text-sm font-bold mt-1">
              ${Number(user?.balance || 0).toFixed(2)}
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
