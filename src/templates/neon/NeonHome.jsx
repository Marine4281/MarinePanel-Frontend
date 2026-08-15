// src/templates/neon/NeonHome.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiZap, FiChevronDown, FiGift } from "react-icons/fi";
import NeonNotificationBanner from "./NeonNotificationBanner";
import {
  FaTiktok, FaInstagram, FaYoutube, FaFacebook,
  FaWhatsapp, FaTelegram, FaLinkedin, FaSnapchat, FaSpotify,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsGrid } from "react-icons/bs";

const PLATFORM_ICONS = {
  All: BsGrid,
  TikTok: FaTiktok,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  Facebook: FaFacebook,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
  "X/Twitter": FaXTwitter,
  LinkedIn: FaLinkedin,
  Snapchat: FaSnapchat,
  Spotify: FaSpotify,
  Free: FiGift,
};

const PLATFORMS = Object.keys(PLATFORM_ICONS);

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

export default function NeonHome() {
  const { user, updateUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services, getGlobalDefault, getPlatformDefault } = useServices();
  const { formatMoney, selected: selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillApplied = useRef(false);

  const brand = { color: childPanel?.themeColor || "#00ff88", name: childPanel?.brandName || "Panel" };
  const neon = brand.color;

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

  const selected = useMemo(
    () => servicesList.find((s) => s.name === service) || null,
    [service, servicesList]
  );

  useEffect(() => { setComments(""); }, [service]);

  const commentLines = comments.split("\n").map((l) => l.trim()).filter(Boolean);
  const customCommentsService = isCustomComments(selected);

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
    if (!service || !selected) { setCharge(0); return; }
    if (selected.isFree) { setCharge(0); return; }
    if (customCommentsService) {
      if (commentLines.length > 0) calculateChargeDebounced(commentLines.length, service);
      else setCharge(0);
    } else if (quantity) {
      calculateChargeDebounced(quantity, service);
    } else {
      setCharge(0);
    }
  }, [service, quantity, comments, selected]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!user?._id) return toast.error("User not logged in");
    if (!category || !service || !link) return toast.error("Please fill in all fields");

    if (customCommentsService) {
      if (commentLines.length === 0) return toast.error("Please enter at least one comment");
      if (commentLines.length < selected?.min)
        return toast.error(`Minimum ${selected?.min} comments required`);
      if (commentLines.length > selected?.max)
        return toast.error(`Maximum ${selected?.max} comments allowed`);
    } else if (!selected?.isFree) {
      if (!quantity) return toast.error("Please enter quantity");
      if (quantity < selected?.min || quantity > selected?.max)
        return toast.error(`Quantity must be between ${selected?.min} and ${selected?.max}`);
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

      toast.success("ORDER PLACED");
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
    background: "#1b1b2a",
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
       <NeonNotificationBanner />
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
          {PLATFORMS.map((p) => {
            const Icon = PLATFORM_ICONS[p];
            const active = platform === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPlatform(p);
                  setCategory("");
                  setService("");
                  setComments("");
                  prefillApplied.current = false;
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? `${neon}18` : "#1b1b2a",
                  color: active ? neon : "#5c5c82",
                  border: `1px solid ${active ? neon + "55" : neon + "12"}`,
                  boxShadow: active ? `0 0 12px ${neon}25` : "none",
                }}
              >
                <Icon size={12} /> {p}
              </button>
            );
          })}
        </div>

        {/* Order form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setService(""); prefillApplied.current = false; }}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}
              >
                <option value="" style={{ background: "#1b1b2a" }}>Select category…</option>
                {categories.map((c) => {
                  const meta = getCatMeta(c);
                  const star = meta?.isFeatured ? (meta.featuredColor === "blue" ? "🔵 " : "⭐ ") : "";
                  return <option key={c} value={c} style={{ background: "#1b1b2a" }}>{star}{c}</option>;
                })}
              </select>
              <FiChevronDown size={13} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: `${neon}44` }} />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Service</label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => { setService(e.target.value); prefillApplied.current = false; }}
                disabled={!category}
                style={{ ...inputStyle, opacity: !category ? 0.4 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)}
              >
                <option value="" style={{ background: "#1b1b2a" }}>Select service…</option>
                {servicesList.map((s) => (
                  <option key={s._id} value={s.name} style={{ background: "#1b1b2a" }}>#{s.serviceId} — {s.name}</option>
                ))}
              </select>
              <FiChevronDown size={13} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: `${neon}44` }} />
            </div>
          </div>

          {/* Description */}
          {selected?.description && (
            <div className="rounded-xl px-4 py-3" style={{ background: `${neon}0a`, border: `1px solid ${neon}18` }}>
              <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#9a9ac2" }}>
                {selected.description}
              </p>
            </div>
          )}

          {/* Info */}
          {selected && !selected.isFree && (
            <div className="grid grid-cols-3 gap-2">
              {[["Rate", formatMoney(selected.rate, 4) + "/K"], ["Min", selected.min], ["Max", selected.max]].map(([k, v]) => (
                <div key={k} className="rounded-xl px-3 py-2 text-center" style={{ background: `${neon}0a`, border: `1px solid ${neon}18` }}>
                  <p className="text-xs" style={{ color: `${neon}55` }}>{k}</p>
                  <p className="text-xs font-black" style={{ color: neon }}>{v}</p>
                </div>
              ))}
            </div>
          )}

          {selected?.isFree && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 w-fit" style={{ background: "#2a220f", border: "1px solid #fbbf2444" }}>
              <FiGift size={15} style={{ color: "#fbbf24" }} />
              <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>FREE SERVICE</span>
              {selected.freeQuantity ? (
                <span className="text-xs" style={{ color: "#eab308" }}>· up to {selected.freeQuantity}</span>
              ) : null}
            </div>
          )}

          {/* Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Target URL</label>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
          </div>

          {/* Quantity OR Custom Comments */}
          {customCommentsService ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>
                Comments <span className="normal-case font-normal" style={{ color: "#5c5c82" }}>(one per line)</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={"Great content!\nKeep it up!\nLove this!"}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120, fontFamily: "monospace" }}
              />
              <div className="flex justify-between text-xs" style={{ color: "#5c5c82" }}>
                <span>
                  {commentLines.length} comment{commentLines.length !== 1 ? "s" : ""}
                  {selected && ` (min ${selected.min} / max ${selected.max})`}
                </span>
                {commentLines.length > 0 && commentLines.length < (selected?.min || 0) && (
                  <span style={{ color: "#f87171", fontWeight: 600 }}>Need {selected.min - commentLines.length} more</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}55` }}>Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                disabled={!selected || selected.isFree}
                placeholder={selected ? `${selected.min}–${selected.max}` : "Amount"}
                style={{ ...inputStyle, opacity: !selected || selected.isFree ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
            </div>
          )}

          {/* Charge */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: `${neon}0c`, border: `1px solid ${neon}22` }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Charge</span>
            <span className="text-xl font-black" style={{ color: neon, textShadow: `0 0 12px ${neon}88` }}>
              {selected?.isFree ? "FREE" : formatMoney(charge, 4)}
            </span>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              !selected ||
              !link ||
              (!customCommentsService && !selected?.isFree && !quantity) ||
              (customCommentsService && commentLines.length === 0)
            }
            className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all uppercase tracking-widest"
            style={{
              background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`,
              color: "#0a0a14",
              boxShadow: `0 0 28px ${neon}44`,
            }}
          >
            <FiZap size={15} />
            {submitting ? "Processing…" : selected?.isFree ? "Claim Free Service" : "Execute Order"}
          </button>
        </form>

        <div className="rounded-2xl p-4" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
          <p className="text-xs" style={{ color: "#5c5c82" }}>{user?.email}</p>
          <p className="text-lg font-black mt-1" style={{ color: neon, textShadow: `0 0 10px ${neon}55` }}>
            {formatMoney(user?.balance || 0, 2)}
          </p>
          <p className="text-xs" style={{ color: "#5c5c82" }}>
            {selectedCurrency?.code === "USD" || !selectedCurrency?._id ? "Base currency (USD)" : `Displayed in ${selectedCurrency.code}`}
          </p>
        </div>
      </div>
    </NeonLayout>
  );
  }
