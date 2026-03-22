// src/pages/AdminSettings.jsx

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";

const AdminSettings = () => {
  const [commission, setCommission] = useState(50);

  const [activationFee, setActivationFee] = useState(25);
  const [withdrawMin, setWithdrawMin] = useState(10);
  const [platformDomain, setPlatformDomain] = useState("marinepanel.online");

  // ✅ NEW: Support fields
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [supportTelegram, setSupportTelegram] = useState("");
  const [supportWhatsappChannel, setSupportWhatsappChannel] = useState("");

  const [loading, setLoading] = useState(false);

  /*
  --------------------------------
  Fetch Settings (ALL)
  --------------------------------
  */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Commission
        const { data } = await API.get("/admin/settings/commission");
        setCommission(data.commission || 50);

        // Reseller + Platform
        const reseller = await API.get("/admin/settings/reseller");

        setActivationFee(reseller.data.resellerActivationFee || 25);
        setWithdrawMin(reseller.data.resellerWithdrawMin || 10);
        setPlatformDomain(reseller.data.platformDomain || "marinepanel.online");

        // ✅ NEW: Support (from same settings object)
        setSupportWhatsapp(reseller.data.supportWhatsapp || "");
        setSupportTelegram(reseller.data.supportTelegram || "");
        setSupportWhatsappChannel(
          reseller.data.supportWhatsappChannel || ""
        );

      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    fetchSettings();
  }, []);

  /*
  --------------------------------
  Update Commission
  --------------------------------
  */
  const handleSaveCommission = async () => {
    try {
      setLoading(true);
      await API.put("/admin/settings/commission", { commission });
      alert("Commission updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update commission");
    } finally {
      setLoading(false);
    }
  };

  /*
  --------------------------------
  Update Reseller + Support Settings
  --------------------------------
  */
  const handleSaveReseller = async () => {
    try {
      setLoading(true);

      await API.put("/admin/settings/reseller", {
        resellerActivationFee: activationFee,
        resellerWithdrawMin: withdrawMin,
        platformDomain,

        // ✅ NEW support fields
        supportWhatsapp,
        supportTelegram,
        supportWhatsappChannel,
      });

      alert("Settings updated successfully");

    } catch (err) {
      console.error(err);
      alert("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  /*
  --------------------------------
  Reset Revenue
  --------------------------------
  */
  const handleResetRevenue = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset revenue? Orders will NOT be affected."
    );

    if (!confirmReset) return;

    try {
      setLoading(true);
      await API.post("/admin/settings/reset-revenue");
      alert("Revenue has been reset successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to reset revenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

        {/* ================= COMMISSION ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Default Commission
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="text-sm text-gray-500">
                Commission Percentage (%)
              </label>

              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full border rounded-lg p-3 text-lg font-semibold"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-semibold mb-1">Example</p>
              <p>Provider: $0.50 → User: $1.00</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveCommission}
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600"
            >
              Save Commission
            </button>
          </div>
        </div>

        {/* ================= RESELLER SETTINGS ================= */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Reseller Platform Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input
              type="number"
              value={activationFee}
              onChange={(e) => setActivationFee(Number(e.target.value))}
              placeholder="Activation Fee"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              value={withdrawMin}
              onChange={(e) => setWithdrawMin(Number(e.target.value))}
              placeholder="Withdraw Min"
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              value={platformDomain}
              onChange={(e) => setPlatformDomain(e.target.value)}
              placeholder="Platform Domain"
              className="border p-3 rounded-lg md:col-span-2"
            />
          </div>

          {/* ================= SUPPORT ================= */}
          <h3 className="mt-6 font-semibold">Support Settings</h3>

          <div className="grid grid-cols-1 gap-4 mt-3">

            <input
              type="text"
              placeholder="WhatsApp (2547...)"
              value={supportWhatsapp}
              onChange={(e) => setSupportWhatsapp(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              placeholder="Telegram link"
              value={supportTelegram}
              onChange={(e) => setSupportTelegram(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="text"
              placeholder="WhatsApp Channel link"
              value={supportWhatsappChannel}
              onChange={(e) =>
                setSupportWhatsappChannel(e.target.value)
              }
              className="border p-3 rounded-lg"
            />

          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveReseller}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* ================= RESET ================= */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Revenue Control
          </h2>

          <button
            onClick={handleResetRevenue}
            disabled={loading}
            className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600"
          >
            Reset Revenue
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
