// src/templates/pulse/PulseHome.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiZap, FiChevronDown } from "react-icons/fi";

const PLATFORMS = [
  { name: "All",        icon: "🌐" },
  { name: "TikTok",    icon: "🎵" },
  { name: "Instagram", icon: "📸" },
  { name: "YouTube",   icon: "▶️" },
  { name: "Facebook",  icon: "💙" },
  { name: "Telegram",  icon: "✈️" },
  { name: "X/Twitter", icon: "✖️" },
  { name: "Free",      icon: "🎁" },
];

export default function PulseHome() {
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

  const brand = { color: childPanel?.themeColor || "#6366f1", name: childPanel?.brandName || "Panel" };

  const filteredByPlatform = services.filter((s) =>
    platform === "All" ? true : s.category?.startsWith(platform)
  );
  const categories = [...new Set(filteredByPlatform.map((s) => s.category))];
  const filteredByCategory = category
    ? filteredByPlatform.filter((s) => s.category === category)
    : filteredByPlatform;
  const selectedService = services.find((s) => s._id === service);

  useEffect(() => {
    if (selectedService && quantity) {
      setCharge(((selectedService.rate / 1000) * Number(quantity)).toFixed(4));
    } else setCharge(0);
  }, [selectedService, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service || !link || !quantity) return toast.error("Fill all fields");
    const qty = Number(quantity);
    if (qty < selectedService.min || qty > selectedService.max)
      return toast.error(`Qty: ${selectedService.min}–${selectedService.max}`);
    setSubmitting(true);
    try {
      const res = await API.post("/orders", {
        serviceId: selectedService.serviceId,
        link,
        quantity: qty,
      });
      if (res.data.newBalance !== undefined)
        setUser?.((prev) => ({ ...prev, balance: res.data.newBalance }));
      toast.success("Order placed!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1.5px solid #f0f0f0",
    background: "#f9fafb",
    color: "#1f2937",
    fontSize: 14,
    outline: "none",
    appearance: "none",
  };

  return (
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Greeting */}
        <div className="pt-1">
          <p className="text-xs text-gray-400 font-semibold">Hello, {user?.email?.split("@")[0]} 👋</p>
          <h2 className="text-xl font-black text-gray-900">New Order</h2>
        </div>

        {/* Platform pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PLATFORMS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setPlatform(p.name); setCategory(""); setService(""); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all"
              style={{
                background: platform === p.name ? brand.color : "#fff",
                color: platform === p.name ? "#fff" : "#6b7280",
                border: `1.5px solid ${platform === p.name ? brand.color : "#f0f0f0"}`,
                boxShadow: platform === p.name ? `0 4px 12px ${brand.color}33` : "none",
              }}
            >
              {p.icon} {p.name}
            </button>
          ))}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setService(""); }}
                style={selectStyle}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f0f0f0")}
              >
                <option value="">Choose category…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service</label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={!category}
                style={{ ...selectStyle, opacity: !category ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f0f0f0")}
              >
                <option value="">Choose service…</option>
                {filteredByCategory.map((s) => (
                  <option key={s._id} value={s._id}>
                    #{s.serviceId} — {s.name}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          {/* Service info pills */}
          {selectedService && (
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Rate", val: `$${Number(selectedService.rate).toFixed(4)}/K` },
                { label: "Min",  val: selectedService.min },
                { label: "Max",  val: selectedService.max },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: `${brand.color}12`, color: brand.color }}
                >
                  {label}: {val}
                </div>
              ))}
            </div>
          )}

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Link / URL</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors"
              onFocus={(e) => (e.target.style.borderColor = brand.color)}
              onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={selectedService ? `${selectedService.min}–${selectedService.max}` : "Enter quantity"}
              className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors"
              onFocus={(e) => (e.target.style.borderColor = brand.color)}
              onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
            />
          </div>

          {/* Charge */}
          {charge > 0 && (
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: `${brand.color}0d`, border: `1.5px solid ${brand.color}22` }}
            >
              <span className="text-sm text-gray-500">Charge</span>
              <span className="text-lg font-black" style={{ color: brand.color }}>${charge}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !service || !link || !quantity}
            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{
              background: brand.color,
              boxShadow: `0 6px 24px ${brand.color}44`,
            }}
          >
            <FiZap size={16} />
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
        </form>
      </div>
    </PulseLayout>
  );
}
