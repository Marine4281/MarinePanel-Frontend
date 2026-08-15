// src/templates/neon/NeonServices.jsx
import { useState, useMemo, useEffect } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import { FiSearch, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";
import {
  FaTiktok, FaInstagram, FaYoutube, FaFacebook,
  FaWhatsapp, FaTelegram, FaLinkedin, FaSnapchat, FaSpotify, FaGift,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsGrid } from "react-icons/bs";

const PLATFORM_ICONS = {
  TikTok: FaTiktok, Instagram: FaInstagram, YouTube: FaYoutube, Facebook: FaFacebook,
  WhatsApp: FaWhatsapp, Telegram: FaTelegram, "X/Twitter": FaXTwitter,
  LinkedIn: FaLinkedin, Snapchat: FaSnapchat, Spotify: FaSpotify, Free: FaGift,
};

// Mirrors ServiceTable.jsx's rate resolution — respects reseller/system overrides when present.
const calculateRate = (service) => {
  if (service?.resellerRate != null) return Number(service.resellerRate);
  if (service?.systemRate != null) return Number(service.systemRate);
  if (service?.rate != null) return Number(service.rate);
  return 0;
};

export default function NeonServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  const neon = childPanel?.themeColor || "#00ff88";

  useEffect(() => {
    API.get("/category-meta").then((r) => setCategoryMeta(r.data || [])).catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => { m[`${c.platform}::${c.category}`] = c; });
    return m;
  }, [categoryMeta]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(
      (s) => s.name?.toLowerCase().includes(q) || String(s.serviceId || "").includes(q) || s.category?.toLowerCase().includes(q)
    );
  }, [services, search]);

  const grouped = useMemo(() => {
    const acc = {};
    filtered.forEach((s) => {
      const key = `${s.platform || "General"} · ${s.category || "Other"}`;
      if (!acc[key]) acc[key] = { platform: s.platform || "General", category: s.category || "Other", items: [] };
      acc[key].items.push(s);
    });
    return Object.values(acc).sort((a, b) => {
      const orderA = metaMap[`${a.platform}::${a.category}`]?.sortOrder ?? 999;
      const orderB = metaMap[`${b.platform}::${b.category}`]?.sortOrder ?? 999;
      return orderA - orderB;
    });
  }, [filtered, metaMap]);

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Catalog</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Services</h2>
        </div>

        <div className="relative">
          <FiSearch size={13} className="absolute left-4 top-3.5" style={{ color: `${neon}44` }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, or category…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            style={{ background: "#1b1b2a", border: `1px solid ${neon}22`, color: "#c4c4e0", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = neon)} onBlur={(e) => (e.target.style.borderColor = `${neon}22`)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-2xl py-12 text-center" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
            <p className="text-sm" style={{ color: "#5c5c82" }}>No services found for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped.map((group) => {
              const key = `${group.platform}::${group.category}`;
              const open = expanded[key] !== false;
              const meta = metaMap[key];
              const featured = meta?.isFeatured;
              const featColor = meta?.featuredColor === "blue" ? "#3b82f6" : "#f97316";
              const Icon = PLATFORM_ICONS[group.platform] || BsGrid;

              return (
                <div key={key} className="rounded-2xl overflow-hidden" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [key]: !open }))}
                    className="w-full flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${neon}14`, color: neon }}>
                        <Icon size={13} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-sm font-black truncate block" style={{ color: "#c4c4e0" }}>{group.category}</span>
                        <span className="text-xs" style={{ color: "#5c5c82" }}>{group.platform}</span>
                      </div>
                      {featured && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: featColor, border: `1px solid ${featColor}55`, background: `${featColor}14` }}
                        >
                          Featured
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-black flex-shrink-0"
                        style={{ background: `${neon}14`, color: neon }}>{group.items.length}</span>
                    </div>
                    {open ? <FiChevronUp size={13} style={{ color: `${neon}44` }} /> : <FiChevronDown size={13} style={{ color: `${neon}44` }} />}
                  </button>

                  {open && (
                    <div style={{ borderTop: `1px solid ${neon}0a` }}>
                      <div className="divide-y" style={{ borderColor: `${neon}08` }}>
                        {group.items.map((svc) => (
                          <div key={svc._id} className="flex items-start justify-between px-4 py-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-semibold truncate" style={{ color: "#8888a8" }}>{svc.name}</p>
                              <p className="text-xs" style={{ color: "#5c5c82" }}>#{svc.serviceId} · {svc.min}–{svc.max}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-black" style={{ color: neon, textShadow: `0 0 6px ${neon}66` }}>
                                {svc.isFree ? "Free" : formatMoney(calculateRate(svc), 4) + "/K"}
                              </span>
                              <button onClick={() => setSelectedService(svc)} style={{ color: "#5c5c82" }}>
                                <FiInfo size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#181828", border: `1px solid ${neon}22` }}>
            <h2 className="text-lg font-black mb-1" style={{ color: "#c4c4e0" }}>{selectedService.name}</h2>
            <p className="text-xs mb-4" style={{ color: "#5c5c82" }}>{selectedService.platform} · {selectedService.category}</p>
            <p className="text-sm whitespace-pre-line mb-4" style={{ color: "#8888a8" }}>
              {selectedService.description || "No description provided."}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[["Rate", selectedService.isFree ? "Free" : formatMoney(calculateRate(selectedService), 4)],
                ["Min", selectedService.min], ["Max", selectedService.max]].map(([k, v]) => (
                <div key={k} className="rounded-xl p-3 text-center" style={{ background: "#141420", border: `1px solid ${neon}18` }}>
                  <p className="text-xs" style={{ color: "#5c5c82" }}>{k}</p>
                  <p className="text-sm font-black" style={{ color: neon }}>{v}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="w-full py-2.5 rounded-xl text-sm font-black"
              style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </NeonLayout>
  );
          }
