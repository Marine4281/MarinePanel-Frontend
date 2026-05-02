// src/pages/childpanel/ChildPanelActivate.jsx
//
// Entry point for any logged-in user who wants to activate
// a child panel. Shows the activation fee, offer banner if
// one is active, brand name input, and domain choice.
// Mirrors ResellerActivate.jsx — same UX pattern.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  FiCheckCircle,
  FiTag,
  FiClock,
  FiGlobe,
  FiZap,
} from "react-icons/fi";

export default function ChildPanelActivate() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [brandName, setBrandName] = useState("");
  const [domainType, setDomainType] = useState("subdomain");
  const [customDomain, setCustomDomain] = useState("");

  const [info, setInfo] = useState(null); // activation fee, offer, billing info
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Already a child panel owner — redirect to dashboard
  useEffect(() => {
    if (user?.isChildPanel && user?.childPanelIsActive) {
      navigate("/child-panel/dashboard");
    }
  }, [user, navigate]);

  // Load activation info + wallet balance
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [feeRes, walletRes] = await Promise.all([
          API.get("/child-panel/activation-fee"),
          API.get("/wallet"),
        ]);

        setInfo(feeRes.data);
        setWallet(walletRes.data?.balance || 0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load activation info");
      } finally {
        setFetching(false);
      }
    };

    fetchInfo();
  }, []);

  const slug = brandName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const handleActivate = async () => {
    if (!brandName.trim()) return toast.error("Brand name is required");
    if (domainType === "custom" && !customDomain.trim())
      return toast.error("Custom domain is required");

    if (wallet < (info?.activationFee || 0)) {
      return toast.error(
        `Insufficient balance. You need $${info?.activationFee} to activate.`
      );
    }

    setLoading(true);

    try {
      const res = await API.post("/child-panel/activate", {
        brandName: brandName.trim(),
        domainType,
        customDomain: domainType === "custom" ? customDomain.trim() : "",
      });

      toast.success(res.data.message || "Child panel activated!");

      // Refresh user in AuthContext so isChildPanel becomes true
      const profileRes = await API.get("/auth/profile");
      login(profileRes.data);

      setTimeout(() => {
        navigate("/child-panel/dashboard");
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fee = info?.activationFee || 0;
  const monthlyFee = info?.monthlyFee || 0;
  const billingMode = info?.billingMode || "monthly";
  const perOrderFee = info?.perOrderFee || 0;
  const offerLabel = info?.offerLabel;
  const offerExpiresAt = info?.offerExpiresAt;
  const hasOffer = !!offerLabel;
  const canAfford = wallet >= fee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 font-semibold hover:underline text-sm"
        >
          &larr; Back
        </button>

        {/* Offer Banner */}
        {hasOffer && (
          <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl p-4 mb-4 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <FiTag size={18} />
              <span className="font-bold text-lg">{offerLabel}</span>
            </div>
            {offerExpiresAt && (
              <div className="flex items-center gap-1 text-sm opacity-90">
                <FiClock size={14} />
                <span>
                  Offer expires{" "}
                  {new Date(offerExpiresAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏢</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Activate Your Child Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Launch your own branded SMM panel with full admin control
            </p>
          </div>

          {/* What you get */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
              What you get
            </p>
            <ul className="space-y-1">
              {[
                "Your own branded panel on a custom domain",
                "Full user & reseller management",
                "Connect your own payment gateway",
                "Add your own service providers",
                "API access for your resellers",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <FiCheckCircle className="text-blue-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Brand Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MyBoostPanel"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Domain Type */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Domain
            </label>

            <div className="space-y-3">
              {/* Subdomain option */}
              <label
                className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition ${
                  domainType === "subdomain"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  value="subdomain"
                  checked={domainType === "subdomain"}
                  onChange={() => setDomainType("subdomain")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <FiZap className="text-blue-500" />
                    Free Subdomain
                  </p>
                  {brandName ? (
                    <p className="text-xs text-blue-500 mt-0.5">
                      {slug}.marinepanel.online
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Enter a brand name to preview
                    </p>
                  )}
                </div>
              </label>

              {/* Custom domain option */}
              <label
                className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition ${
                  domainType === "custom"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  value="custom"
                  checked={domainType === "custom"}
                  onChange={() => setDomainType("custom")}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <FiGlobe className="text-blue-500" />
                    Custom Domain
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    e.g. panel.yourdomain.com
                  </p>
                  {domainType === "custom" && (
                    <input
                      type="text"
                      placeholder="panel.yourdomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      onClick={(e) => e.preventDefault()}
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Activation Fee</span>
              <span className="font-bold text-gray-800">${fee}</span>
            </div>

            {billingMode === "monthly" || billingMode === "both" ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Fee</span>
                <span className="font-medium text-gray-700">
                  ${monthlyFee}/mo
                </span>
              </div>
            ) : null}

            {billingMode === "per_order" || billingMode === "both" ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Per-Order Fee</span>
                <span className="font-medium text-gray-700">
                  ${perOrderFee}/order
                </span>
              </div>
            ) : null}

            <div className="border-t pt-2 flex justify-between text-sm">
              <span className="text-gray-600">Your Balance</span>
              <span
                className={`font-bold ${
                  canAfford ? "text-green-600" : "text-red-500"
                }`}
              >
                ${Number(wallet).toFixed(2)}
              </span>
            </div>

            {!canAfford && (
              <p className="text-xs text-red-500 mt-1">
                You need ${(fee - wallet).toFixed(2)} more to activate. Please
                deposit first.
              </p>
            )}
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={loading || !canAfford}
            className={`w-full py-3 rounded-xl font-semibold text-white transition text-sm ${
              canAfford
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading
              ? "Activating..."
              : `Activate & Pay $${fee}`}
          </button>

          {!canAfford && (
            <button
              onClick={() => navigate("/wallet")}
              className="w-full mt-2 py-2.5 rounded-xl border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition"
            >
              Deposit Funds
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By activating, you agree to the platform's terms of service.
        </p>
      </div>
    </div>
  );
}
