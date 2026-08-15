// src/templates/tide/TideHome.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import FloatingSupport from "../../components/FloatingSupport";
import TideNotificationBanner from "./TideNotificationBanner";

import {
  FiSend, FiChevronDown, FiGift, FiInfo,
} from "react-icons/fi";
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

export default function TideHome() {
  const { user, updateUser } = useAuth();
  const { childPanel } = useChildPanel();
  const { services, getGlobalDefault, getPlatformDefault } = useServices();
  const { formatMoney, selected } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillApplied = useRef(false);

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };

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

      toast.success("Order placed successfully");
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass =
    "w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 appearance-none disabled:opacity-50";

  return (
    <TideLayout>
      <TideNotificationBanner />
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main form ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100" style={{ borderLeft: `4px solid ${brand.color}` }}>
              <h2 className="font-black text-gray-900">New Order</h2>
              <p className="text-xs text-gray-400 mt-0.5">Place a new social media order</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              {/* Platform tabs */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Platform</label>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                        style={{
                          background: active ? brand.color : "#fff",
                          color: active ? "#fff" : "#6b7280",
                          borderColor: active ? brand.color : "#e5e7eb",
                        }}
                      >
                        <Icon size={12} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setService(""); prefillApplied.current = false; }}
                    className={selectClass}
                  >
                    <option value="">Select category…</option>
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service</label>
                <div className="relative">
                  <select
                    value={service}
                    onChange={(e) => { setService(e.target.value); prefillApplied.current = false; }}
                    disabled={!category}
                    className={selectClass}
                  >
                    <option value="">Select service…</option>
                    {servicesList.map((s) => (
                      <option key={s._id} value={s.name}>#{s.serviceId} — {s.name}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="absolute right-4 top-4 text-gray-300 pointer-events-none" />
                </div>
              </div>

              {/* Service description */}
              {selectedServiceData?.description && (
                <div className="rounded-xl px-4 py-3 border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                    {selectedServiceData.description}
                  </p>
                </div>
              )}

              {/* Service info */}
              {selectedServiceData && !selectedServiceData.isFree && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Rate", formatMoney(selectedServiceData.rate, 4) + "/K"],
                    ["Min", selectedServiceData.min],
                    ["Max", selectedServiceData.max],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className="text-sm font-black" style={{ color: brand.color }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedServiceData?.isFree && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 bg-amber-50 border border-amber-200 w-fit">
                  <FiGift size={15} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">FREE SERVICE</span>
                  {selectedServiceData.freeQuantity ? (
                    <span className="text-xs text-amber-600">· up to {selectedServiceData.freeQuantity}</span>
                  ) : null}
                </div>
              )}

              {/* Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link / URL</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800"
                />
              </div>

              {/* Quantity OR Custom Comments */}
              {customCommentsService ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Comments <span className="normal-case font-normal text-gray-400">(one per line)</span>
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={"Great content!\nKeep it up!\nLove this!"}
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 resize-y min-h-[120px] font-mono"
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={!selectedServiceData || selectedServiceData.isFree}
                    placeholder={selectedServiceData ? `${selectedServiceData.min}–${selectedServiceData.max}` : "Enter quantity"}
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 outline-none text-gray-800 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Charge */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3 border"
                style={{ background: `${brand.color}08`, borderColor: `${brand.color}25` }}>
                <span className="text-sm text-gray-600">Estimated Charge</span>
                <span className="text-xl font-black" style={{ color: brand.color }}>
                  {selectedServiceData?.isFree ? "FREE" : formatMoney(charge, 4)}
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !selectedServiceData ||
                  !link ||
                  (!customCommentsService && !selectedServiceData?.isFree && !quantity) ||
                  (customCommentsService && commentLines.length === 0)
                }
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}
              >
                <FiSend size={15} />
                {submitting ? "Placing Order…" : selectedServiceData?.isFree ? "Claim Free Service" : "Place Order"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Side info ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 text-sm mb-3 flex items-center gap-2">
              <FiInfo size={14} style={{ color: brand.color }} />
              How it works
            </h3>
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
              {formatMoney(user?.balance || 0, 2)}
            </p>
            <p className="text-xs text-gray-400">
              {selected?.code === "USD" || !selected?._id ? "Base currency (USD)" : `Displayed in ${selected.code}`}
            </p>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="mt-3 w-full text-xs font-bold py-2 rounded-lg border"
              style={{ borderColor: `${brand.color}44`, color: brand.color }}
            >
              View Order History
            </button>
          </div>
        </div>
      </div>

      <FloatingSupport />
    </TideLayout>
  );
      }
