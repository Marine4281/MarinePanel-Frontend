// src/components/FloatingSupport.jsx

import React, { useState } from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  // Use child panel support if on cp domain,
  // otherwise fall back to reseller support
  const support =
    domainType === "childPanel" && childPanel
      ? childPanel.support || {}
      : reseller?.support || {};

  const toggleMenu = () => setOpen(!open);

  // ======================= FORMAT HELPERS =======================

  const formatWhatsApp = (number) => {
    if (!number) return "";
    return `https://wa.me/${number.replace(/\D/g, "")}`;
  };

  const formatTelegram = (link) => {
    if (!link) return "";
    if (link.startsWith("http")) return link;
    return `https://t.me/${link.replace("@", "")}`;
  };

  const whatsappLink = formatWhatsApp(support.whatsapp);
  const telegramLink = formatTelegram(support.telegram);
  const whatsappChannelLink = support.whatsappChannel || "";

  const hasLinks = whatsappLink || telegramLink || whatsappChannelLink;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Dropdown */}
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2">
          {hasLinks ? (
            <>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
                >
                  <FaWhatsapp /> Contact Support
                </a>
              )}

              {telegramLink && (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
                >
                  <FaTelegramPlane /> Telegram Updates
                </a>
              )}

              {whatsappChannelLink && (
                <a
                  href={whatsappChannelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
                >
                  <FaWhatsapp /> WhatsApp Updates
                </a>
              )}
            </>
          ) : (
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg shadow text-sm">
              Support links are currently unavailable
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl animate-bounce transition"
      >
        <FaWhatsapp size={24} />
      </button>
    </div>
  );
};

export default FloatingSupport;
