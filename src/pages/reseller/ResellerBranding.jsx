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

  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState("");
  const [themeColor, setThemeColor] = useState("#16a34a"); // default green

  // Load branding dynamically
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/branding", { withCredentials: true });

        setBrandName(res.data.brandName || "");
        setLogo(res.data.logo || "");
        setThemeColor(res.data.themeColor || "#16a34a");

        // Update context immediately
        if (setReseller) {
          setReseller((prev) => ({
            ...prev,
            brandName: res.data.brandName || prev.brandName,
            logo: res.data.logo || prev.logo,
            themeColor: res.data.themeColor || prev.themeColor,
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, [setReseller]);

  // Live theme preview
  useEffect(() => {
    if (setReseller) {
      setReseller((prev) => ({
        ...prev,
        themeColor,
      }));
    }
  }, [themeColor, setReseller]);

  // Save branding (logo & theme only)
  const saveBranding = async () => {
    if (!logo && !themeColor) {
      toast.error("Nothing to update");
      return;
    }

    try {
      setSaving(true);

      const payload = { logo, themeColor };
      await API.patch("/branding", payload, { withCredentials: true });

      // Update context
      if (setReseller) setReseller({ ...reseller, ...payload });

      toast.success("Branding updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">
        <h1 className="text-xl font-bold text-orange-500 mb-6">
          {reseller.brandName || "Reseller Panel"}
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
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading branding...
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 max-w-xl">

            {/* Live Header Preview */}
            <div
              className="flex items-center gap-4 mb-6 p-4 rounded"
              style={{ backgroundColor: themeColor }}
            >
              {logo && (
                <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
              )}
              <h2 className="text-white text-lg font-bold">
                {brandName || reseller.brandName || "Reseller"}
              </h2>
            </div>

            {/* Brand Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName || reseller.brandName || ""}
                disabled
                className="w-full border rounded p-2 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Brand name is linked to your domain and cannot be changed.
              </p>
            </div>

            {/* Logo */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Logo URL
              </label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full border rounded p-2"
              />
              {logo && (
                <img src={logo} alt="Logo Preview" className="h-12 mt-2" />
              )}
            </div>

            {/* Theme Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Theme Color
              </label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-10 w-16 p-0 border-0 rounded"
              />
            </div>

            <button
              onClick={saveBranding}
              disabled={saving}
              className={`px-4 py-2 rounded text-white ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {saving ? "Saving..." : "Save Branding"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
          }
