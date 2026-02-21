// src/components/FloatingSupport.jsx
import React, { useState } from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa6";

const FloatingSupport = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Menu Items */}
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2">
          <a
            href="https://wa.me/254736790305"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
          >
            <FaWhatsapp /> Contact Support
          </a>

          <a
            href="https://t.me/MarinePanel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
          >
            <FaTelegramPlane /> Telegram Updates
          </a>

          <a
            href="https://whatsapp.com/channel/0029VbBoHseHQbSA13fLfe1v"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition"
          >
            <FaWhatsapp /> WhatsApp Updates
          </a>
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
