// src/templates/aurora/AuroraHome.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import AuroraLayout from "./AuroraLayout";
import AuroraNotificationBanner from "./AuroraNotificationBanner";
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

export default function AuroraHome() {
  const { user, updateUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services, getGlobalDefault, getPlatformDefault } = useServices();
  const { formatMoney } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillApplied = useRef(false);

  const brand = { color: childPanel?.themeColor || "#a78bfa", name: childPanel?.brandName || "Panel" };

  const [platform, setPlatform]     = useState("All");
  const [category, setCategory]     = useState("");
  const [service, setService]       = useState("");
  const [link, setLink]             = useState("");
  const [quantity, setQuantity]     = useState("");
  const [comments, setComments]     = useState("");
  const [charge, setCharge]         = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [categoryMeta, setCategoryMeta] = useState([]);

  useEffect(() => {
    API.get("/category-meta").then((r) => setCategoryMeta(r.data || [])).catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => { m[`${c.platform}::${c.category}`] = c; });
    return m;
  }, [categoryMeta]);

  /* ---------- REPLACE / PREFILL ---------- */
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

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    appearance: "none",
  };

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-6 pt-2">
        <AuroraNotificationBanner />

        {/* Welcome */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: brand.color }}>
            New Order
          </p>
          <h2 className="text-2xl font-black text-white">What can we boost?</h2>
        </div>

        {/* Platform pills */}
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPlatform(p.name);
                setCategory("");
                setService("");
                setComments("");
                prefillApplied.current = false;
              }}
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
                onChange={(e) => { setCategory(e.target.value); setService(""); prefillApplied.current = false; }}
                style={{ ...inputStyle, color: category ? "#e2e8f0" : "rgba(255,255,255,0.35)" }}
              >
                <option value="" style={{ background: "#1a1730" }}>Select category…</option>
                {categories.map((c) => {
                  const meta = getCatMeta(c);
                  const star = meta?.isFeatured ? (meta.featuredColor === "blue" ? "🔵 " : "⭐ ") : "";
                  return <option key={c} value={c} style={{ background: "#1a1730", color: "#e2e8f0" }}>{star}{c}</option>;
                })}
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
                onChange={(e) => { setService(e.target.value); prefillApplied.current = false; }}
                disabled={!category}
                style={{ ...inputStyle, color: service ? "#e2e8f0" : "rgba(255,255,255,0.35)", opacity: !category ? 0.5 : 1 }}
              >
                <option value="" style={{ background: "#1a1730" }}>Select service…</option>
                {servicesList.map((s) => (
                  <option key={s._id} value={s.name} style={{ background: "#1a1730", color: "#e2e8f0" }}>
                    #{s.serviceId} — {s.name}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
          </div>

          {/* Description */}
          {selectedServiceData?.description && (
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.55)" }}>
                {selectedServiceData.description}
              </p>
            </div>
          )}

          {/* Service info */}
          {selectedServiceData && !selectedServiceData.isFree && (
            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: `${brand.color}12`, border: `1px solid ${brand.color}25` }}>
              <div className="flex justify-between">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Rate</span>
                <span className="font-semibold" style={{ color: brand.color }}>
                  {formatMoney(selectedServiceData.rate, 4)} / 1K
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Min / Max</span>
                <span className="text-white">{selectedServiceData.min} / {selectedServiceData.max}</span>
              </div>
            </div>
          )}

          {selectedServiceData?.isFree && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 w-fit" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
              <FiGift size={15} style={{ color: "#fbbf24" }} />
              <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>FREE SERVICE</span>
              {selectedServiceData.freeQuantity ? (
                <span className="text-xs" style={{ color: "#fde68a" }}>· up to {selectedServiceData.freeQuantity}</span>
              ) : null}
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
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = brand.color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Quantity OR Custom Comments */}
          {customCommentsService ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                Comments <span className="normal-case font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>(one per line)</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={"Great content!\nKeep it up!\nLove this!"}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120, fontFamily: "monospace" }}
              />
              <div className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span>
                  {commentLines.length} comment{commentLines.length !== 1 ? "s" : ""}
                  {selectedServiceData && ` (min ${selectedServiceData.min} / max ${selectedServiceData.max})`}
                </span>
                {commentLines.length > 0 && commentLines.length < (selectedServiceData?.min || 0) && (
                  <span style={{ color: "#f87171", fontWeight: 600 }}>Need {selectedServiceData.min - commentLines.length} more</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!selectedServiceData || selectedServiceData.isFree}
                placeholder={selectedServiceData ? `${selectedServiceData.min} – ${selectedServiceData.max}` : "Enter quantity"}
                style={{ ...inputStyle, opacity: !selectedServiceData || selectedServiceData.isFree ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = brand.color)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          )}

          {/* Charge summary */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: `${brand.color}15`, border: `1px solid ${brand.color}30` }}>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Estimated charge</span>
            <span className="text-base font-black" style={{ color: brand.color }}>
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`,
              color: "#fff",
              boxShadow: `0 4px 24px ${brand.color}40`,
            }}
          >
            <FiZap size={16} />
            {submitting ? "Placing Order..." : selectedServiceData?.isFree ? "Claim Free Service" : "Place Order"}
          </button>
        </form>
      </div>
    </AuroraLayout>
  );
    }
