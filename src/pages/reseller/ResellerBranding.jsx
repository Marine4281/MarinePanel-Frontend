// src/pages/reseller/ResellerBranding.jsx

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useReseller } from "../../context/ResellerContext";

export default function ResellerBranding() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { reseller, setReseller } = useReseller();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core
  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState("");
  const [themeColor, setThemeColor] = useState("#16a34a");

  // Support
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  /*
  APPLY THEME
  */
  useEffect(() => {
    if (reseller?.themeColor) {
      document.documentElement.style.setProperty(
        "--theme-color",
        reseller.themeColor
      );
    }
  }, []);

  /*
  FETCH BRANDING
  */
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/branding/dashboard", {
          withCredentials: true,
        });

        const data = res.data || {};

        const newBranding = {
          brandName: data?.brandName || "",
          logo: data?.logo || "",
          themeColor: data?.themeColor || "#16a34a",
          domain: data?.domain || "",
          support: {
            whatsapp: data?.support?.whatsapp || "",
            telegram: data?.support?.telegram || "",
            whatsappChannel: data?.support?.whatsappChannel || "",
          },
        };

        // ✅ FULL SAFE SET (not partial)
        setReseller((prev) => ({
          ...prev,
          ...newBranding,
        }));

        // Local sync
        setBrandName(newBranding.brandName);
        setLogo(newBranding.logo);
        setThemeColor(newBranding.themeColor);

        setSupportWhatsapp(newBranding.support.whatsapp);
        setSupportTelegram(newBranding.support.telegram);
        setSupportWhatsappChannel(newBranding.support.whatsappChannel);

        document.documentElement.style.setProperty(
          "--theme-color",
          newBranding.themeColor
        );
        document.title = newBranding.brandName || "Reseller Panel";
      } catch (err) {
        console.error("Failed to load branding:", err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [setReseller]);

  /*
  LIVE PREVIEW
  */
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-color",
      themeColor
    );
  }, [themeColor]);

  /*
  SAVE
  */
  const saveBranding = async () => {
    try {
      setSaving(true);

      const payload = {
        brandName,
        logo,
        themeColor,
        supportWhatsapp,
        supportTelegram,
        supportWhatsappChannel,
      };

      const res = await API.patch("/branding", payload, {
        withCredentials: true,
      });

      const updated = res.data?.branding;

      if (!updated) {
        throw new Error("Invalid response from server");
      }

      // ✅ TRUST BACKEND RESPONSE ONLY
      const updatedBranding = {
        brandName: updated.brandName,
        logo: updated.logo,
        themeColor: updated.themeColor,
        domain: updated.domain,
        support: {
          whatsapp: updated.support?.whatsapp || "",
          telegram: updated.support?.telegram || "",
          whatsappChannel: updated.support?.whatsappChannel || "",
        },
      };

      setReseller((prev) => ({
        ...prev,
        ...updatedBranding,
      }));

      // Sync local again (important)
      setSupportWhatsapp(updatedBranding.support.whatsapp);
      setSupportTelegram(updatedBranding.support.telegram);
      setSupportWhatsappChannel(
        updatedBranding.support.whatsappChannel
      );

      document.documentElement.style.setProperty(
        "--theme-color",
        updatedBranding.themeColor
      );
      document.title = updatedBranding.brandName;

      toast.success("Branding updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading branding...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">
        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {reseller?.brandName || "Reseller Panel"}
        </h1>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500"
          >
            <FiArrowLeft /> Back
          </button>

          <Link to="/reseller/dashboard">Dashboard</Link>
          <Link to="/reseller/users">Users</Link>
          <Link to="/reseller/orders">Orders</Link>

          <Link
            to="/reseller/branding"
            className="text-orange-500 font-semibold"
          >
            Branding
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-500 mt-6"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="bg-white shadow rounded-lg p-6 max-w-xl">

          {/* Preview */}
          <div
            className="flex items-center gap-4 mb-6 p-4 rounded"
            style={{ backgroundColor: themeColor }}
          >
            {logo && (
              <img src={logo} alt="Logo" className="h-12 w-12" />
            )}
            <h2 className="text-white font-bold">
              {brandName || "Reseller"}
            </h2>
          </div>

          {/* Inputs */}
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full border p-2 mb-3"
            placeholder="Brand Name"
          />

          <input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="w-full border p-2 mb-3"
            placeholder="Logo URL"
          />

          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="mb-6"
          />

          {/* SUPPORT */}
          <input
            placeholder="WhatsApp"
            value={supportWhatsapp}
            onChange={(e) => setSupportWhatsapp(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          <input
            placeholder="Telegram"
            value={supportTelegram}
            onChange={(e) => setSupportTelegram(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          <input
            placeholder="WhatsApp Channel"
            value={supportWhatsappChannel}
            onChange={(e) =>
              setSupportWhatsappChannel(e.target.value)
            }
            className="w-full border p-2 mb-6"
          />

          <button
            onClick={saveBranding}
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save Branding"}
          </button>

        </div>
      </div>
    </div>
  );
            }
