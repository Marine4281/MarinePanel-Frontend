// src/templates/tide/TideServices.jsx
import { useState, useMemo, useEffect } from "react";
import { useChildPanel } from "../../context/ChildPanelContext";
import { useServices } from "../../context/ServicesContext";
import { useCurrency } from "../../context/CurrencyContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import {
  FiSearch, FiChevronDown, FiChevronUp, FiInfo,
} from "react-icons/fi";
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

export default function TideServices() {
  const { childPanel } = useChildPanel();
  const { services, loading } = useServices();
  const { formatMoney } = useCurrency();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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
    return Object.values(acc);
  }, [filtered]);

  return (
    <TideLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-gray-900">Services</h2>
          <p className="text-xs text-gray-400">Browse all available services and rates</p>
        </div>

        <div className="relative max-w-md">
          <FiSearch size={15} className="absolute left-4 top-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or category…"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border border-gray-200 bg-white shadow-sm outline-none text-gray-800"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
            <p className="text-sm text-gray-400">No services found for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => {
              const key = `${group.platform}::${group.category}`;
              const open = expanded[key] !== false;
              const meta = metaMap[key];
              const Icon = PLATFORM_ICONS[group.platform] || BsGrid;

              return (
                <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [key]: !open }))}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${brand.color}12`, color: brand.color }}>
                        <Icon size={14} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="font-black text-sm text-gray-900 truncate block">{group.category}</span>
                        <span className="text-xs text-gray-400">{group.platform}</span>
                      </div>
                      {meta?.isFeatured && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                          Featured
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                        style={{ background: `${brand.color}12`, color: brand.color }}>
                        {group.items.length}
                      </span>
                    </div>
                    {open ? <FiChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <FiChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
                  </button>

                  {open && (
                    <div className="border-t border-gray-50 overflow-x-auto">
                      <div className="min-w-[560px]">
                        <div className="grid grid-cols-12 px-5 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <div className="col-span-1">#</div>
                          <div className="col-span-5">Name</div>
                          <div className="col-span-2 text-center">Min</div>
                          <div className="col-span-2 text-center">Max</div>
                          <div className="col-span-1 text-right">Rate</div>
                          <div className="col-span-1 text-right">Info</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {group.items.map((svc) => (
                            <div key={svc._id} className="grid grid-cols-12 px-5 py-3 items-center hover:bg-gray-50 transition-colors">
                              <div className="col-span-1 text-xs text-gray-400">{svc.serviceId}</div>
                              <div className="col-span-5 text-xs font-semibold text-gray-800 truncate pr-2">{svc.name}</div>
                              <div className="col-span-2 text-xs text-gray-500 text-center">{svc.min}</div>
                              <div className="col-span-2 text-xs text-gray-500 text-center">{svc.max}</div>
                              <div className="col-span-1 text-xs font-black text-right" style={{ color: brand.color }}>
                                {svc.isFree ? "Free" : formatMoney(calculateRate(svc), 4)}
                              </div>
                              <div className="col-span-1 text-right">
                                <button
                                  onClick={() => setSelectedService(svc)}
                                  className="text-gray-300 hover:text-gray-500"
                                >
                                  <FiInfo size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-black text-gray-900 mb-1">{selectedService.name}</h2>
            <p className="text-xs text-gray-400 mb-4">{selectedService.platform} · {selectedService.category}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
              {selectedService.description || "No description provided."}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[["Rate", selectedService.isFree ? "Free" : formatMoney(calculateRate(selectedService), 4)],
                ["Min", selectedService.min], ["Max", selectedService.max]].map(([k, v]) => (
                <div key={k} className="rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="text-sm font-black" style={{ color: brand.color }}>{v}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: brand.color }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </TideLayout>
  );
}
