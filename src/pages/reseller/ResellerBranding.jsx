import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResellerBranding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState("");
  const [themeColor, setThemeColor] = useState("#ff6600");

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await API.get("/reseller/dashboard");

        setBrandName(res.data.brandName || "");
        setLogo(res.data.logo || "");
        setThemeColor(res.data.themeColor || "#ff6600");

      } catch (err) {
        console.error(err);
        toast.error("Failed to load branding");
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  const saveBranding = async () => {
    try {
      await API.post("/reseller/branding", {
        brandName,
        logo,
        themeColor
      });

      toast.success("Branding updated successfully");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save branding");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md p-6">

        <h1 className="text-xl font-bold text-orange-500 mb-6">
          Reseller Panel
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
          <Link to="/reseller/branding" className="text-orange-500 font-semibold">
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

            <h2 className="text-lg font-bold text-orange-500 mb-6">
              Reseller Branding
            </h2>

            {/* Brand Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full border rounded p-2"
              />
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
              />
            </div>

            <button
              onClick={saveBranding}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Save Branding
            </button>

          </div>

        )}

      </div>
    </div>
  );
}
