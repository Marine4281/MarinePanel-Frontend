import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // <-- import auth context

export default function ResellerActivate() {
  const navigate = useNavigate();
  const { user } = useAuth(); // <-- get logged-in user

  const [brandName, setBrandName] = useState("");
  const [domainType, setDomainType] = useState("subdomain");
  const [customDomain, setCustomDomain] = useState("");

  const [activationFee, setActivationFee] = useState(0);
  const [platformDomain, setPlatformDomain] = useState("");
  const [wallet, setWallet] = useState(0);

  const [loading, setLoading] = useState(false);

  /*
  --------------------------------
  Redirect if already a reseller
  --------------------------------
  */
  useEffect(() => {
    if (user?.isReseller) {
      navigate("/reseller/dashboard");
    }
  }, [user, navigate]);

  /*
  --------------------------------
  Load Activation Fee + Wallet
  --------------------------------
  */
  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await API.get("/reseller/activation-fee");
        setActivationFee(res.data.fee);
        setPlatformDomain(res.data.platformDomain);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load activation fee");
      }
    };

    const fetchWallet = async () => {
      try {
        const res = await API.get("/reseller/dashboard");
        setWallet(res.data.wallet);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFee();
    fetchWallet();
  }, []);

  /*
  --------------------------------
  Activate Reseller
  --------------------------------
  */
  const handleActivate = async () => {
    if (!brandName) return toast.error("Brand name required");
    if (domainType === "custom" && !customDomain)
      return toast.error("Custom domain required");

    setLoading(true);

    try {
      const res = await API.post("/reseller/activate", {
        brandName,
        domainType,
        customDomain,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/reseller/dashboard");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Activation failed");
    }

    setLoading(false);
  };

  const slug = brandName.toLowerCase().replace(/[^a-z0-9]/g, "");

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-orange-500 font-semibold hover:underline"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">
        Activate Your Reseller Panel
      </h1>

      {/* Brand Name */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Brand Name</label>
        <input
          type="text"
          placeholder="MyPanel"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Domain Option */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Choose Domain Type</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="subdomain"
              checked={domainType === "subdomain"}
              onChange={() => setDomainType("subdomain")}
            />
            Free Subdomain
          </label>

          {brandName && platformDomain && (
            <p className="text-sm text-gray-500 ml-6">
              {slug}.{platformDomain}
            </p>
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="custom"
              checked={domainType === "custom"}
              onChange={() => setDomainType("custom")}
            />
            Custom Domain
          </label>

          {domainType === "custom" && (
            <input
              type="text"
              placeholder="panel.mydomain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="border rounded-lg p-2 ml-6"
            />
          )}
        </div>
      </div>

      {/* Fee & Wallet Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between mb-2">
          <span>Activation Fee</span>
          <span className="font-bold">${activationFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Your Wallet</span>
          <span className="font-bold">${wallet}</span>
        </div>
      </div>

      {/* Activate Button */}
      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
      >
        {loading ? "Activating..." : `Activate & Pay $${activationFee}`}
      </button>

    </div>
  );
  }
