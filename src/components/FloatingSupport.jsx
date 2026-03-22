// src/components/FloatingSupport.jsx
import React, { useState } from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useReseller } from "../context/ResellerContext";

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);
  const { reseller } = useReseller();

  const toggleMenu = () => setOpen(!open);

  const support = reseller?.support || {};

  // ✅ Format helpers (safe + professional)
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Menu Items */}
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2">

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

          {/* ✅ Optional: fallback message when no links */}
          {!whatsappLink && !telegramLink && !whatsappChannelLink && (
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg shadow text-sm">
              No support links available
            </div>
          )}

        </div>
      )}

      {/* Main Floating Button */}
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
