// src/templates/aurora/AuroraHome.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiSend, FiZap, FiChevronDown } from "react-icons/fi";

const PLATFORMS = [
  { name: "All",       icon: "🌐" },
  { name: "TikTok",   icon: "🎵" },
  { name: "Instagram",icon: "📸" },
  { name: "YouTube",  icon: "▶️" },
  { name: "Facebook", icon: "💙" },
  { name: "Telegram", icon: "✈️" },
  { name: "X/Twitter",icon: "✖️" },
  { name: "Spotify",  icon: "🎧" },
  { name: "Free",     icon: "🎁" },
];

export default function AuroraHome() {
  const { user, setUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services, loading: servicesLoading } = useServices();
  const navigate = useNavigate();

  const [platform, setPlatform]   = useState("All");
  const [category, setCategory]   = useState("");
  const [service, setService]     = useState("");
  const [link, setLink]           = useState("");
  const [quantity, setQuantity]   = useState("");
  const [charge, setCharge]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [catOpen, setCatOpen]     = useState(false);
  const [svcOpen, setSvcOpen]     = useState(false);

  const brand = {
    color: childPanel?.themeColor || "#a78bfa",
    name:  childPanel?.brandName  || "Panel",
  };

  // Filter services
  const filteredByPlatform = services.filter((s) =>
    platform === "All" ? true : s.category?.startsWith(platform)
  );

  const categories = [...new Set(filteredByPlatform.map((s) => s.category))];

  const filteredByCategory = category
    ? filteredByPlatform.filter((s) => s.category === category)
    : filteredByPlatform;

  const selectedService = services.find((s) => s._id === service);

  // Auto-calc charge
  useEffect(() => {
    if (selectedService && quantity) {
      const rate = selectedService.rate || 0;
      setCharge(((rate / 1000) * Number(quantity)).toFixed(4));
    } else {
      setCharge(0);
    }
  }, [selectedService, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service || !link || !quantity) return toast.error("Fill all fields");
    if (!selectedService) return;

    const qty = Number(quantity);
    if (qty < selectedService.min || qty > selectedService.max) {
      return toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`);
    }

    setSubmitting(true);
    try {
      const res = await API.post("/orders", {
        serviceId: selectedService.serviceId,
        link,
        quantity: qty,
      });
      if (res.data.newBalance !== undefined) {
        setUser?.((prev) => ({ ...prev, balance: res.data.newBalance }));
      }
      toast.success("Order placed!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">

        {/* Welcome */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: brand.color }}>
            New Order
          </p>
          <h2 className="text-2xl font-black text-white">
            What can we boost?
          </h2>
        </div>

        {/* Platform pills */}
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setPlatform(p.name); setCategory(""); setService(""); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: platform === p.name ? brand.color : "rgba(255,255,255,0.07)",
                color: platform === p.name ? "#fff" : "rgba(255,255,255,0.5)",
                border: `1px solid ${platform === p.name ? brand.color : "transparent"}`,
              }}
            >
              <span>{p.icon}</span>
              {p.name}
            </button>
          ))}
        </div>

        {/* Order card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setService(""); }}
                className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: category ? "#e2e8f0" : "rgba(255,255,255,0.35)",
                }}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c} value={c} style={{ background: "#1a1730", color: "#e2e8f0" }}>
                    {c}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Service
            </label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={!category}
                className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: service ? "#e2e8f0" : "rgba(255,255,255,0.35)",
                  opacity: !category ? 0.5 : 1,
                }}
              >
                <option value="">Select service…</option>
                {filteredByCategory.map((s) => (
                  <option key={s._id} value={s._id} style={{ background: "#1a1730", color: "#e2e8f0" }}>
                    #{s.serviceId} — {s.name}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
          </div>

          {/* Service info */}
          {selectedService && (
            <div
              className="rounded-xl p-3 text-xs space-y-1"
              style={{ background: `${brand.color}12`, border: `1px solid ${brand.color}25` }}
            >
              <div className="flex justify-between">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Rate</span>
                <span className="font-semibold" style={{ color: brand.color }}>
                  ${Number(selectedService.rate).toFixed(4)} / 1K
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Min / Max</span>
                <span className="text-white">{selectedService.min} / {selectedService.max}</span>
              </div>
            </div>
          )}

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Link / URL
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
              onFocus={(e) => (e.target.style.borderColor = brand.color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={selectedService ? `${selectedService.min} – ${selectedService.max}` : "Enter quantity"}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
              onFocus={(e) => (e.target.style.borderColor = brand.color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Charge summary */}
          {charge > 0 && (
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: `${brand.color}15`, border: `1px solid ${brand.color}30` }}
            >
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Estimated charge
              </span>
              <span className="text-base font-black" style={{ color: brand.color }}>
                ${charge}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !service || !link || !quantity}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
              color: "#fff",
              boxShadow: `0 4px 24px ${brand.color}40`,
            }}
          >
            <FiZap size={16} />
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </AuroraLayout>
  );
}
