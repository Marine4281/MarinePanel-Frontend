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

  // Core branding
  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState("");
  const [themeColor, setThemeColor] = useState("#16a34a");

  // ✅ SUPPORT STATE
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  // APPLY EXISTING THEME
  useEffect(() => {
    if (reseller?.themeColor) {
      document.documentElement.style.setProperty(
        "--theme-color",
        reseller.themeColor
      );
    }
  }, [reseller?.themeColor]);

  // FETCH BRANDING
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/branding/dashboard", {
          withCredentials: true,
        });

        const data = res.data || {};

        // Local state
        setBrandName(data.brandName || "");
        setLogo(data.logo || "");
        setThemeColor(data.themeColor || "#16a34a");

        // ✅ SUPPORT FIX: always fallback to empty string
        setSupportWhatsapp(data.support?.whatsapp ?? "");
        setSupportTelegram(data.support?.telegram ?? "");
        setSupportWhatsappChannel(data.support?.whatsappChannel ?? "");

        // Safe global state merge
        setReseller((prev) => ({
          ...prev,
          brandName: data.brandName || prev.brandName,
          logo: data.logo || prev.logo,
          themeColor: data.themeColor || prev.themeColor,
          support: {
            whatsapp: data.support?.whatsapp ?? "",
            telegram: data.support?.telegram ?? "",
            whatsappChannel: data.support?.whatsappChannel ?? "",
          },
        }));

        document.documentElement.style.setProperty(
          "--theme-color",
          data.themeColor || "#16a34a"
        );
        document.title = data.brandName || "Reseller Panel";
      } catch (err) {
        console.error("Failed to load branding:", err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [setReseller]);

  // LIVE THEME PREVIEW
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  // SAVE BRANDING + SUPPORT
  const saveBranding = async () => {
    try {
      setSaving(true);

      const payload = {
        brandName,
        logo,
        themeColor,
        // ✅ SUPPORT INCLUDED
        supportWhatsapp,
        supportTelegram,
        supportWhatsappChannel,
      };

      const res = await API.patch("/branding", payload, {
        withCredentials: true,
      });

      const updated = res.data?.branding;

      // ✅ SAFE UPDATE for support
      setSupportWhatsapp(updated.support?.whatsapp ?? "");
      setSupportTelegram(updated.support?.telegram ?? "");
      setSupportWhatsappChannel(updated.support?.whatsappChannel ?? "");

      // Update global state safely
      setReseller((prev) => ({
        ...prev,
        brandName: updated?.brandName || prev.brandName,
        logo: updated?.logo || prev.logo,
        themeColor: updated?.themeColor || prev.themeColor,
        support: {
          whatsapp: updated.support?.whatsapp ?? "",
          telegram: updated.support?.telegram ?? "",
          whatsappChannel: updated.support?.whatsappChannel ?? "",
        },
      }));

      document.title = updated.brandName || "Reseller Panel";
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
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-12 object-contain"
              />
            )}
            <h2 className="text-white text-lg font-bold">
              {brandName || "Reseller"}
            </h2>
          </div>

          {/* Brand */}
          <div className="mb-4">
            <label className="text-sm font-medium">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          {/* Logo */}
          <div className="mb-4">
            <label className="text-sm font-medium">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="text-sm font-medium">Theme Color</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="h-10 w-16 mt-1"
            />
          </div>

          {/* ✅ SUPPORT SECTION */}
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4 text-gray-700">
              Support Links
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="WhatsApp Number (e.g. 2547...)"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                className="w-full border rounded p-2"
              />

              <input
                type="text"
                placeholder="Telegram Username or Link"
                value={supportTelegram}
                onChange={(e) => setSupportTelegram(e.target.value)}
                className="w-full border rounded p-2"
              />

              <input
                type="text"
                placeholder="WhatsApp Channel Link"
                value={supportWhatsappChannel}
                onChange={(e) =>
                  setSupportWhatsappChannel(e.target.value)
                }
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <button
            onClick={saveBranding}
            disabled={saving}
            className={`mt-6 px-4 py-2 rounded text-white ${
              saving
                ? "bg-gray-400"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {saving ? "Saving..." : "Save Branding"}
          </button>

        </div>
      </div>
    </div>
  );
            }
