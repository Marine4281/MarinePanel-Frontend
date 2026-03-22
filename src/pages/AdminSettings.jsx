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
  Fetch Settings
  --------------------------------
  */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get("/admin/settings/commission");
        setCommission(data.commission || 50);

        const reseller = await API.get("/admin/settings/reseller");

        setActivationFee(reseller.data.resellerActivationFee || 25);
        setWithdrawMin(reseller.data.resellerWithdrawMin || 10);
        setPlatformDomain(
          reseller.data.platformDomain || "marinepanel.online"
        );

        // ✅ Load support
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
  Update Reseller Settings
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

      alert("Reseller settings updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update reseller settings");
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

        {/* COMMISSION SETTINGS */}
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

              <p className="text-xs text-gray-400 mt-2">
                Applied automatically to all services
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-semibold mb-1">Example</p>

              <p>
                Provider price:
                <span className="font-medium"> $0.50 / 1K</span>
              </p>

              <p>
                User sees:
                <span className="font-bold text-green-600"> $1.00 / 1K</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveCommission}
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
            >
              Save Commission
            </button>
          </div>
        </div>

        {/* RESELLER SETTINGS */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Reseller Platform Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-gray-500">
                Reseller Activation Fee ($)
              </label>

              <input
                type="number"
                value={activationFee}
                onChange={(e) => setActivationFee(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Minimum Withdraw ($)
              </label>

              <input
                type="number"
                value={withdrawMin}
                onChange={(e) => setWithdrawMin(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500">
                Platform Domain
              </label>

              <input
                type="text"
                value={platformDomain}
                onChange={(e) => setPlatformDomain(e.target.value)}
                className="w-full border rounded-lg p-3"
              />

              <p className="text-xs text-gray-400 mt-2">
                Example: resellerbrand.<b>{platformDomain}</b>
              </p>
            </div>
          </div>

          {/* ✅ SUPPORT SETTINGS */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-md font-semibold mb-4">
              Support Configuration
            </h3>

            <div className="grid grid-cols-1 gap-4">

              <input
                type="text"
                placeholder="WhatsApp Number (with country code, no +)"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Telegram Username or Link"
                value={supportTelegram}
                onChange={(e) => setSupportTelegram(e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="WhatsApp Channel Invite Link"
                value={supportWhatsappChannel}
                onChange={(e) =>
                  setSupportWhatsappChannel(e.target.value)
                }
                className="border p-3 rounded-lg"
              />

            </div>

            <p className="text-xs text-gray-400 mt-3">
              These will be used as default support for users and resellers.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveReseller}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              Save Reseller Settings
            </button>
          </div>
        </div>

        {/* RESET REVENUE */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">
            Revenue Control
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            This will reset total revenue statistics. Orders will NOT be affected.
          </p>

          <button
            onClick={handleResetRevenue}
            disabled={loading}
            className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition disabled:opacity-50"
          >
            Reset Revenue
          </button>
        </div>

      </main>
    </div>
  );
};

export default AdminSettings;
