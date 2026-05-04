// src/templates/tide/TideProfile.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiUser, FiLogOut } from "react-icons/fi";

export default function TideProfile() {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const [cur, setCur]         = useState("");
  const [nw, setNw]           = useState("");
  const [con, setCon]         = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw]   = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [saving, setSaving]   = useState(false);

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

  const handlePwChange = async () => {
    if (!cur || !nw || !con) return toast.error("All fields required");
    if (nw !== con) return toast.error("Passwords don't match");
    if (nw.length < 6) return toast.error("Min 6 characters");
    setSaving(true);
    try {
      await API.put("/users/change-password", { currentPassword: cur, newPassword: nw });
      toast.success("Password updated");
      setCur(""); setNw(""); setCon("");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors pr-12";

  const PwField = ({ label, value, onChange, show, toggle }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}
          onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        <button type="button" onClick={toggle} className="absolute right-4 top-3.5 text-gray-300">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <TideLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc)` }}>
              <div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto flex items-center justify-center text-3xl font-black text-white">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <div className="p-5">
              <p className="font-black text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-2xl font-black" style={{ color: brand.color }}>
                  ${Number(user?.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
            <FiLogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Change password */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100" style={{ borderLeft: `4px solid ${brand.color}` }}>
              <h3 className="font-black text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
            </div>
            <div className="p-6 space-y-4">
              <PwField label="Current Password" value={cur} onChange={setCur} show={showCur} toggle={() => setShowCur((s) => !s)} />
              <PwField label="New Password" value={nw} onChange={setNw} show={showNw} toggle={() => setShowNw((s) => !s)} />
              <PwField label="Confirm New Password" value={con} onChange={setCon} show={showCon} toggle={() => setShowCon((s) => !s)} />
              <button onClick={handlePwChange} disabled={saving}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: brand.color, boxShadow: `0 4px 14px ${brand.color}44` }}>
                {saving ? "Saving…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TideLayout>
  );
}
