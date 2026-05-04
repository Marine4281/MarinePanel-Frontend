// src/templates/neon/NeonProfile.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiLock, FiEye, FiEyeOff, FiLogOut } from "react-icons/fi";

export default function NeonProfile() {
  const { user, logout } = useAuth();
  const { childPanel } = useChildPanel();
  const [cur, setCur]         = useState("");
  const [nw, setNw]           = useState("");
  const [con, setCon]         = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNw, setShowNw]   = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [saving, setSaving]   = useState(false);

  const neon = childPanel?.themeColor || "#00ff88";

  const inputStyle = { background: "#0d0d1a", border: `1px solid ${neon}22`, color: "#c4c4e0", width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, fontSize: 14, outline: "none" };

  const handlePwChange = async () => {
    if (!cur || !nw || !con) return toast.error("All fields required");
    if (nw !== con) return toast.error("Keys don't match");
    if (nw.length < 6) return toast.error("Min 6 chars");
    setSaving(true);
    try {
      await API.put("/users/change-password", { currentPassword: cur, newPassword: nw });
      toast.success("Key updated");
      setCur(""); setNw(""); setCon("");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
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

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-lg">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Account</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Profile</h2>
        </div>

        {/* ID card */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#0d0d1a", border: `1px solid ${neon}25`, boxShadow: `0 0 32px ${neon}0a` }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
            style={{ background: `${neon}14`, color: neon, border: `1px solid ${neon}33`, boxShadow: `0 0 16px ${neon}33` }}>
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-black" style={{ color: "#c4c4e0" }}>{user?.email}</p>
            <p className="text-xs" style={{ color: "#3a3a5a" }}>
              Online since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-sm font-black mt-1" style={{ color: neon, textShadow: `0 0 8px ${neon}66` }}>
              ${Number(user?.balance || 0).toFixed(2)} credits
            </p>
          </div>
        </div>

        {/* Change key */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "#0d0d1a", border: `1px solid ${neon}18` }}>
          <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: neon }}>
            <FiLock size={13} /> Change Access Key
          </p>
          <PwField label="Current Key" value={cur} onChange={setCur} show={showCur} toggle={() => setShowCur((s) => !s)} />
          <PwField label="New Key" value={nw} onChange={setNw} show={showNw} toggle={() => setShowNw((s) => !s)} />
          <PwField label="Confirm Key" value={con} onChange={setCon} show={showCon} toggle={() => setShowCon((s) => !s)} />
          <button onClick={handlePwChange} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${neon}cc, ${neon}88)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}>
            {saving ? "Updating…" : "Update Key"}
          </button>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
          <FiLogOut size={14} /> Terminate Session
        </button>
      </div>
    </NeonLayout>
  );
}
