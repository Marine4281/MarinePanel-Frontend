// src/templates/tide/TideHome.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiSend, FiChevronDown } from "react-icons/fi";

const PLATFORMS = [
  "All", "TikTok", "Instagram", "YouTube", "Facebook", "Telegram", "X/Twitter", "Spotify", "Free",
];

export default function TideHome() {
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

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };

  const filtered = services.filter((s) => platform === "All" ? true : s.category?.startsWith(platform));
  const categories = [...new Set(filtered.map((s) => s.category))];
  const filteredByCat = category ? filtered.filter((s) => s.category === category) : filtered;
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
      toast.success("Order placed!");
      navigate("/orders");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <TideLayout>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-gray-100" style={{ borderLeft: `4px solid ${brand.color}` }}>
              <h2 className="font-black text-gray-900">New Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">Place a new social media order</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Platform tabs */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button key={p} type="button"
                      onClick={() => { setPlatform(p); setCategory(""); setService(""); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                      style={{
                        background: platform === p ? brand.color : "#fff",
                        color: platform === p ? "#fff" : "#6b7280",
                        borderColor: platform === p ? brand.color : "#e5e7eb",
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setService(""); }}
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 appearance-none"
                    onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
                    <option value="">Select category…</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
                </div>
              </div>

              {/* Service */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service</label>
                <div className="relative">
                  <select value={service} onChange={(e) => setService(e.target.value)} disabled={!category}
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 appearance-none disabled:opacity-50"
                    onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
                    <option value="">Select service…</option>
                    {filteredByCat.map((s) => <option key={s._id} value={s._id}>#{s.serviceId} — {s.name}</option>)}
                  </select>
                  <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
                </div>
              </div>

              {/* Service info */}
              {selected && (
                <div className="grid grid-cols-3 gap-3">
                  {[["Rate", `$${Number(selected.rate).toFixed(4)}/K`], ["Min", selected.min], ["Max", selected.max]].map(([k, v]) => (
                    <div key={k} className="rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className="text-sm font-black" style={{ color: brand.color }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link / URL</label>
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors"
                  onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  placeholder={selected ? `${selected.min}–${selected.max}` : "Enter quantity"}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 transition-colors"
                  onFocus={(e) => (e.target.style.borderColor = brand.color)} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* Charge */}
              {charge > 0 && (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{ background: `${brand.color}08`, borderColor: `${brand.color}25` }}>
                  <span className="text-sm text-gray-600">Estimated Charge</span>
                  <span className="text-xl font-black" style={{ color: brand.color }}>${charge}</span>
                </div>
              )}

              <button type="submit" disabled={submitting || !service || !link || !quantity}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}>
                <FiSend size={15} />
                {submitting ? "Placing Order…" : "Place Order"}
              </button>
            </form>
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 text-sm mb-3">How it works</h3>
            <div className="space-y-3">
              {[
                ["1", "Choose your platform and service"],
                ["2", "Enter the link you want to boost"],
                ["3", "Set your quantity and place order"],
                ["4", "Watch your stats grow!"],
              ].map(([step, text]) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: brand.color }}>
                    {step}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 text-sm mb-2">Your Account</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <p className="text-lg font-black mt-1" style={{ color: brand.color }}>
              ${Number(user?.balance || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">Available balance</p>
          </div>
        </div>
      </div>
    </TideLayout>
  );
}
