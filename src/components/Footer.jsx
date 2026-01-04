// src/components/Footer.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: "Home", icon: "fas fa-home", path: "/home" },
    { name: "Wallet", icon: "fas fa-wallet", path: "/wallet" },
    { name: "Orders", icon: "fa-solid fa-cart-shopping", path: "/orders" },
    {
      name: "Support",
      icon: "fab fa-whatsapp",
      external: true,
      path: "https://wa.me/254741148620?text=Hello%20MarinePanel%20Support",
      badge: "24/7 Support", // ✅ Add a badge
    },
    { name: "Profile", icon: "fas fa-user", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 bg-orange-400 w-full z-50">
      <div className="flex justify-between text-center p-2">
        {links.map((link) =>
          link.external ? (
            <a
              key={link.name}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-white relative"
            >
              <i className={`${link.icon} text-lg`}></i>
              <span className="text-xs">{link.name}</span>

              {/* ✅ Badge for WhatsApp */}
              {link.badge && (
                <span className="absolute -top-2 right-0 bg-green-500 text-white text-[9px] px-1 rounded-full">
                  {link.badge}
                </span>
              )}
            </a>
          ) : (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center gap-1 ${
                location.pathname === link.path ? "text-green-300" : "text-white"
              }`}
            >
              <i className={`${link.icon} text-lg`}></i>
              <span className="text-xs">{link.name}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
};

export default Footer;