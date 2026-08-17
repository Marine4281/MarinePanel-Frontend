// src/templates/pulse/PulseHome.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import PulseLayout from "./PulseLayout";
import PulseNotificationBanner from "./PulseNotificationBanner";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiZap, FiChevronDown, FiGift } from "react-icons/fi";

const PLATFORMS = [
  { name: "All",        icon: "🌐" },
  { name: "TikTok",     icon: "🎵" },
  { name: "Instagram",  icon: "📸" },
  { name: "YouTube",    icon: "▶️" },
  { name: "Facebook",   icon: "💙" },
  { name: "WhatsApp",   icon: "💬" },
  { name: "Telegram",   icon: "✈️" },
  { name: "X/Twitter",  icon: "✖️" },
  { name: "LinkedIn",   icon: "💼" },
  { name: "Snapchat",   icon: "👻" },
  { name: "Spotify",    icon: "🎧" },
  { name: "Free",       icon: "🎁" },
];

const isCustomComments = (serviceData) =>
  serviceData?.serviceType === "Custom Comments" ||
  serviceData?.serviceType === "Custom Comments Package";

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function PulseHome() {
  const { user, updateUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services, getGlobalDefault, getPlatformDefault } = useServices();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillApplied = useRef(false);

  const brand = { color: childPanel?.themeColor || "#6366f1", name: childPanel?.brandName || "Panel" };

  const [platform, setPlatform]     = useState("All");
  const [category, setCategory]     = useState("");
  const [service, setService]       = useState("");
  const [link, setLink]             = useState("");
  const [quantity, setQuantity]     = useState("");
  const [comments, setComments]     = useState("");
  const [charge, setCharge]         = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [categoryMeta, setCategoryMeta] = useState([]);

  /* ---------- FEATURED CATEGORY META ---------- */
  useEffect(() => {
    API.get("/category-meta").then((r) => setCategoryMeta(r.data || [])).catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => { m[`${c.platform}::${c.category}`] = c; });
    return m;
  }, [categoryMeta]);

  /* ---------- REPLACE / PREFILL (from Orders "Replace") ---------- */
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill || !services.length || prefillApplied.current) return;
    prefillApplied.current = true;
    setPlatform(prefill.platform || "All");
    setCategory(prefill.category || "");
    setService(prefill.service || "");
    setLink(prefill.link || "");
    setQuantity(prefill.quantity || "");
  }, [location.state, services]);

  /* ---------- DEFAULT PLATFORM ---------- */
  useEffect(() => {
    if (!services.length || prefillApplied.current) return;
    const globalDefault = getGlobalDefault?.();
    if (globalDefault) {
      setPlatform(globalDefault.platform);
      setCategory(globalDefault.category);
    } else {
      setPlatform("All");
    }
  }, [services]);

  const platformServices = useMemo(() => {
    if (platform === "All") return services;
    return services.filter((s) => s.platform === platform);
  }, [services, platform]);

  const getCatMeta = useCallback(
    (cat) => {
      const svc = platformServices.find((s) => s.category === cat);
      return metaMap[`${svc?.platform}::${cat}`];
    },
    [platformServices, metaMap]
  );

  const categories = useMemo(() => {
    const list = [...new Set(platformServices.map((s) => s.category))];
    return list.sort((a, b) => {
      const orderA = getCatMeta(a)?.sortOrder ?? 999;
      const orderB = getCatMeta(b)?.sortOrder ?? 999;
      return orderA - orderB;
    });
  }, [platformServices, getCatMeta]);

  /* ---------- DEFAULT CATEGORY ---------- */
  useEffect(() => {
    if (!platform || prefillApplied.current) return;
    if (platform === "All") {
      setCategory(categories[0] || "");
      return;
    }
    const platformDefault = getPlatformDefault?.(platform);
    setCategory(platformDefault ? platformDefault.category : categories[0] || "");
  }, [platform, categories]);

  const servicesList = useMemo(
    () => platformServices.filter((s) => s.category === category),
    [platformServices, category]
  );

  /* ---------- DEFAULT SERVICE ---------- */
  useEffect(() => {
    if (!servicesList.length || prefillApplied.current) return;
    const def = servicesList.find((s) => s.isDefault) || servicesList[0];
    setService(def.name);
  }, [servicesList]);

  const selectedServiceData = useMemo(
    () => servicesList.find((s) => s.name === service) || null,
    [service, servicesList]
  );

  useEffect(() => { setComments(""); }, [service]);

  const commentLines = comments.split("\n").map((l) => l.trim()).filter(Boolean);
  const customCommentsService = isCustomComments(selectedServiceData);

  /* ---------- CHARGE (server-authoritative) ---------- */
  const calculateChargeBackend = async (qty, serviceName) => {
    if (!qty || !serviceName) { setCharge(0); return; }
    try {
      const res = await API.post("/orders/preview", { service: serviceName, quantity: Number(qty) });
      setCharge(res.data?.finalCharge ? Number(res.data.finalCharge) : 0);
    } catch {
      setCharge(0);
      toast.error("Failed to calculate charge");
    }
  };

  const calculateChargeDebounced = useCallback(
    debounce((qty, serviceName) => calculateChargeBackend(qty, serviceName), 200),
    []
  );

  useEffect(() => {
    if (!service || !selectedServiceData) { setCharge(0); return; }
    if (selectedServiceData.isFree) { setCharge(0); return; }
    if (customCommentsService) {
      if (commentLines.length > 0) calculateChargeDebounced(commentLines.length, service);
      else setCharge(0);
    } else if (quantity) {
      calculateChargeDebounced(quantity, service);
    } else {
      setCharge(0);
    }
  }, [service, quantity, comments, selectedServiceData]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!user?._id) return toast.error("User not logged in");
    if (!category || !service || !link) return toast.error("Please fill in all fields");

    if (customCommentsService) {
      if (commentLines.length === 0) return toast.error("Please enter at least one comment");
      if (commentLines.length < selectedServiceData?.min)
        return toast.error(`Minimum ${selectedServiceData?.min} comments required`);
      if (commentLines.length > selectedServiceData?.max)
        return toast.error(`Maximum ${selectedServiceData?.max} comments allowed`);
    } else if (!selectedServiceData?.isFree) {
      if (!quantity) return toast.error("Please enter quantity");
      if (quantity < selectedServiceData?.min || quantity > selectedServiceData?.max)
        return toast.error(`Quantity must be between ${selectedServiceData?.min} and ${selectedServiceData?.max}`);
    }

    setSubmitting(true);
    try {
      const res = await API.post("/orders", {
        userId: user._id,
        category,
        service,
        link,
        quantity: customCommentsService ? commentLines.length : Number(quantity) || 0,
        comments: customCommentsService ? comments.trim() : "",
      });

      toast.success("Order placed!");
      setLink(""); setQuantity(""); setComments(""); setCharge(0);

      if (res.data?.balance !== undefined) {
        updateUser?.({ balance: res.data.balance });
      }
      try {
        const profileRes = await API.get("/users/profile");
        updateUser?.(profileRes.data);
      } catch {
        // balance already updated above — non-fatal
      }
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
      <div className="max-w-lg mx-auto space-y-5 → max-w-2xl mx-auto space-y-5">
        <PulseNotificationBanner />

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
              onClick={() => {
                setPlatform(p.name);
                setCategory("");
                setService("");
                setComments("");
                prefillApplied.current = false;
              }}
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
                onChange={(e) => { setCategory(e.target.value); setService(""); prefillApplied.current = false; }}
                style={selectStyle}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f0f0f0")}
              >
                <option value="">Choose category…</option>
                {categories.map((c) => {
                  const meta = getCatMeta(c);
                  const star = meta?.isFeatured ? (meta.featuredColor === "blue" ? "🔵 " : "⭐ ") : "";
                  return <option key={c} value={c}>{star}{c}</option>;
                })}
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
                onChange={(e) => { setService(e.target.value); prefillApplied.current = false; }}
                disabled={!category}
                style={{ ...selectStyle, opacity: !category ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f0f0f0")}
              >
                <option value="">Choose service…</option>
                {servicesList.map((s) => (
                  <option key={s._id} value={s.name}>#{s.serviceId} — {s.name}</option>
                ))}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          {selectedServiceData?.description && (
            <div className="rounded-2xl px-4 py-3 bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                {selectedServiceData.description}
              </p>
            </div>
          )}

          {/* Service info pills */}
          {selectedServiceData && !selectedServiceData.isFree && (
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Rate", val: formatMoney(selectedServiceData.rate, 4) + "/K" },
                { label: "Min",  val: selectedServiceData.min },
                { label: "Max",  val: selectedServiceData.max },
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

          {selectedServiceData?.isFree && (
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-amber-50 border border-amber-200 w-fit">
              <FiGift size={15} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700">FREE SERVICE</span>
              {selectedServiceData.freeQuantity ? (
                <span className="text-xs text-amber-600">· up to {selectedServiceData.freeQuantity}</span>
              ) : null}
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

          {/* Quantity OR Custom Comments */}
          {customCommentsService ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Comments <span className="normal-case font-normal text-gray-400">(one per line)</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={"Great content!\nKeep it up!\nLove this!"}
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 resize-y min-h-[120px] font-mono"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  {commentLines.length} comment{commentLines.length !== 1 ? "s" : ""}
                  {selectedServiceData && ` (min ${selectedServiceData.min} / max ${selectedServiceData.max})`}
                </span>
                {commentLines.length > 0 && commentLines.length < (selectedServiceData?.min || 0) && (
                  <span className="text-red-500 font-semibold">Need {selectedServiceData.min - commentLines.length} more</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!selectedServiceData || selectedServiceData.isFree}
                placeholder={selectedServiceData ? `${selectedServiceData.min}–${selectedServiceData.max}` : "Enter quantity"}
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-100 bg-gray-50 outline-none text-gray-800 transition-colors disabled:opacity-50"
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "#f3f4f6")}
              />
            </div>
          )}

          {/* Charge */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: `${brand.color}0d`, border: `1.5px solid ${brand.color}22` }}
          >
            <span className="text-sm text-gray-500">Charge</span>
            <span className="text-lg font-black" style={{ color: brand.color }}>
              {selectedServiceData?.isFree ? "FREE" : formatMoney(charge, 4)}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              !selectedServiceData ||
              !link ||
              (!customCommentsService && !selectedServiceData?.isFree && !quantity) ||
              (customCommentsService && commentLines.length === 0)
            }
            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{
              background: brand.color,
              boxShadow: `0 6px 24px ${brand.color}44`,
            }}
          >
            <FiZap size={16} />
            {submitting ? "Placing Order…" : selectedServiceData?.isFree ? "Claim Free Service" : "Place Order"}
          </button>
        </form>
      </div>
    </PulseLayout>
  );
    }
