// src/components/FloatingSupport.jsx

import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useReseller } from "../context/ResellerContext";
import API from "../api/axios";

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);
  const [support, setSupport] = useState({
    whatsapp: "",
    telegram: "",
    whatsappChannel: "",
  });

  const { reseller } = useReseller();

  const toggleMenu = () => setOpen(!open);

  /*
  --------------------------------
  LOAD SUPPORT LINKS
  Priority:
  1. Reseller branding (domain-based)
  2. Admin settings (fallback)
  --------------------------------
  */
  useEffect(() => {
    const fetchSupport = async () => {
      try {
        // ✅ If reseller domain → use reseller support
        if (
          reseller &&
          reseller.domain &&
          reseller.domain !== "marinepanel.online"
        ) {
          setSupport({
            whatsapp: reseller.supportWhatsApp || "",
            telegram: reseller.supportTelegram || "",
            whatsappChannel: reseller.supportWhatsAppChannel || "",
          });
          return;
        }

        // ✅ Otherwise fallback to admin settings
        const { data } = await API.get("/admin/settings/support");

        setSupport({
          whatsapp: data.supportWhatsApp || "",
          telegram: data.supportTelegram || "",
          whatsappChannel: data.supportWhatsAppChannel || "",
        });
      } catch (err) {
        console.error("Failed to load support links:", err);
      }
    };

    fetchSupport();
  }, [reseller]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* Floating Menu */}
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2">

          {/* WhatsApp */}
          {support.whatsapp && (
            <a
              href={`https://wa.me/${support.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
            >
              <FaWhatsapp /> Contact Support
            </a>
          )}

          {/* Telegram */}
          {support.telegram && (
            <a
              href={support.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
            >
              <FaTelegramPlane /> Telegram Updates
            </a>
          )}

          {/* WhatsApp Channel */}
          {support.whatsappChannel && (
            <a
              href={support.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
            >
              <FaWhatsapp /> WhatsApp Updates
            </a>
          )}

        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleMenu}
        className="text-white p-4 rounded-full shadow-xl transition"
        style={{
          backgroundColor: reseller?.themeColor || "#16a34a",
        }}
      >
        <FaWhatsapp size={24} />
      </button>
    </div>
  );
};

export default FloatingSupport;
