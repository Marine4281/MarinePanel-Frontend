import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaTelegramPlane, FaHeadset } from "react-icons/fa";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import { useSupport } from "../context/SupportContext";

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();
  const { userUnread, fmt } = useSupport();

  const support =
    domainType === "childPanel" && childPanel
      ? childPanel.support || {}
      : reseller?.support || {};

  const formatWhatsApp  = (n) => n ? `https://wa.me/${n.replace(/\D/g, "")}` : "";
  const formatTelegram  = (l) => !l ? "" : l.startsWith("http") ? l : `https://t.me/${l.replace("@", "")}`;

  const whatsappLink        = formatWhatsApp(support.whatsapp);
  const telegramLink        = formatTelegram(support.telegram);
  const whatsappChannelLink = support.whatsappChannel || "";
  const hasLinks = whatsappLink || telegramLink || whatsappChannelLink;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2">
          {/* Ticket support button */}
          <button
            onClick={() => { navigate("/support"); setOpen(false); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition relative"
          >
            <FaHeadset /> Support Tickets
            {userUnread > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow animate-bounce">
                {fmt(userUnread)}
              </span>
            )}
          </button>

          {hasLinks ? (
            <>
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition">
                  <FaWhatsapp /> Contact Support
                </a>
              )}
              {telegramLink && (
                <a href={telegramLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition">
                  <FaTelegramPlane /> Telegram Updates
                </a>
              )}
              {whatsappChannelLink && (
                <a href={whatsappChannelLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition">
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

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="relative bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl animate-bounce transition"
      >
        <FaWhatsapp size={24} />
        {userUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow">
            {fmt(userUnread)}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingSupport;
