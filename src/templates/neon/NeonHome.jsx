// src/templates/neon/NeonHome.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiZap, FiChevronDown } from "react-icons/fi";

const PLATFORMS = [
  { name: "All", icon: "⬡" }, { name: "TikTok", icon: "◈" },
  { name: "Instagram", icon: "◉" }, { name: "YouTube", icon: "▷" },
  { name: "Facebook", icon: "◎" }, { name: "Telegram", icon: "◁" },
  { name: "X/Twitter", icon: "✕" }, { name: "Free", icon: "◇" },
];

export default function NeonHome() {
  const { user, setUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services } = useServices();
  const navigate = useNavigate();

  const [platform, setPlatform]     = useState("All");
  const [category, setCategory]     = useState("");
  const [service, setService]       = useState("");
  const [link, setLink]             = useState("");
  const [quantity, setQuantity]     = useState("");
  const [charge, setCharge]         = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const brand = { color: childPanel?.themeColor || "#00ff88", name: childPanel?.brandName || "Panel" };
  const neon = brand.color;

  const filteredByPlatform = services.filter((s) =>
    platform === "All" ? true : s.category?.startsWith(platform)
  );
  const categories = [...new Set(filteredByPlatform.map((s) => s.category))];
  const filteredByCat = category ? filteredByPlatform.filter((s) => s.category === category) : filteredByPlatform;
  const selected = services.find((s) => s._id === service);

  useEffect(() => {
    if (selected && quantity) setCharge(((selected.rate / 1000) * Number(quantity)).toFixed(4));
    else setCharge(0);
  }, [selected, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service || !link || !quantity) return toast.error("Fill all fields");
    const qty = Number(quantity);
    if (qty < selected.min || qty > selected.max)
      return toast.error(`Qty: ${selected.min}–${selected.max}`);
    setSubmitting(true);
    try {
      const res = await API.post("/orders", { serviceId: selected.serviceId, link, quantity: qty });
      if (res.data.newBalance !== undefined)
        setUser?.((prev) => ({ ...prev, balance: res.data.newBalance }));
      toast.success("ORDER PLACED");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const inputStyle = {
    background: "#0d0d1a",
    border: `1px solid ${neon}22`,
    color: "#c4c4e0",
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    appearance: "none",
  };

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>New Order</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>
            Command Center
          </h2>
        </div>

        {/* Platform grid */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button key={p.name} onClick={() => { setPlatform(p.name); setCategory(""); setService(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: platform === p.name ? `${neon}18` : "#0d0d1a",
                color: platform === p.name ? neon : "#3a3a5a",
                border: `1px solid ${platform === p.name ? neon + "55" : neon + "12"}`,
                boxShadow: platform === p.name ? `0 0 12px ${neon}25` : "none",
              }}
            >
              <span>{p.icon}</span> {p.name}
            </button>
          ))}
        </div>

        {/* Order form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5" style={{ background: "#0d0d1a", border: `1px solid ${neon}18` }}>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Category</label>
            <div className="relative">
              <select value={category} onChange={(e) => { setCategory(e.target.value); setService(""); }} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}>
                <option value="" style={{ background: "#0d0d1a" }}>Select category…</option>
                {categories.map((c) => <option key={c} value={c} style={{ background: "#0d0d1a" }}>{c}</option>)}
              </select>
              <FiChevronDown size={13} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: `${neon}44` }} />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Service</label>
            <div className="relative">
              <select value={service} onChange={(e) => setService(e.target.value)} disabled={!category}
                style={{ ...inputStyle, opacity: !category ? 0.4 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}>
                <option value="" style={{ background: "#0d0d1a" }}>Select service…</option>
                {filteredByCat.map((s) => <option key={s._id} value={s._id} style={{ background: "#0d0d1a" }}>#{s.serviceId} — {s.name}</option>)}
              </select>
              <FiChevronDown size={13} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: `${neon}44` }} />
            </div>
          </div>

          {/* Info */}
          {selected && (
            <div className="grid grid-cols-3 gap-2">
              {[["Rate", `$${Number(selected.rate).toFixed(4)}/K`], ["Min", selected.min], ["Max", selected.max]].map(([k, v]) => (
                <div key={k} className="rounded-xl px-3 py-2 text-center" style={{ background: `${neon}0a`, border: `1px solid ${neon}18` }}>
                  <p className="text-xs" style={{ color: `${neon}55` }}>{k}</p>
                  <p className="text-xs font-black" style={{ color: neon }}>{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Target URL</label>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder={selected ? `${selected.min}–${selected.max}` : "Amount"} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
          </div>

          {/* Charge */}
          {charge > 0 && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: `${neon}0c`, border: `1px solid ${neon}22` }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Charge</span>
              <span className="text-xl font-black" style={{ color: neon, textShadow: `0 0 12px ${neon}88` }}>${charge}</span>
            </div>
          )}

          <button type="submit" disabled={submitting || !service || !link || !quantity}
            className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all uppercase tracking-widest"
            style={{
              background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`,
              color: "#0a0a14",
              boxShadow: `0 0 28px ${neon}44`,
            }}>
            <FiZap size={15} />
            {submitting ? "Processing…" : "Execute Order"}
          </button>
        </form>
      </div>
    </NeonLayout>
  );
}
