// src/pages/Home.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useServices } from "../context/ServicesContext";

import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
import FloatingSupport from "../components/FloatingSupport";

import InfoBanner from "../components/home/InfoBanner";
import CategoryIcons from "../components/home/CategoryIcons";
import CategorySelect from "../components/home/CategorySelect";
import ServiceSelect from "../components/home/ServiceSelect";

const isCustomComments = (serviceData) =>
  serviceData?.serviceType === "Custom Comments" ||
  serviceData?.serviceType === "Custom Comments Package";

const Home = () => {
  const { user, setUser } = useAuth();
  const { services, loading, getGlobalDefault, getPlatformDefault } = useServices();

  const location = useLocation();
  const prefillApplied = useRef(false);

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comments, setComments] = useState("");
  const [charge, setCharge] = useState(0);

  const categoriesGrid = [
    { name: "All" },
    { name: "TikTok", icon: "tiktok" },
    { name: "Instagram", icon: "instagram" },
    { name: "YouTube", icon: "youtube" },
    { name: "Facebook", icon: "facebook" },
    { name: "WhatsApp", icon: "whatsapp" },
    { name: "Telegram", icon: "telegram" },
    { name: "X/Twitter", icon: "x-twitter" },
    { name: "LinkedIn", icon: "linkedin" },
    { name: "Snapchat", icon: "snapchat" },
    { name: "Spotify", icon: "spotify" },
    { name: "Free", icon: "gift" },
  ];

  /* =============================
     PREFILL (REPLACE ORDER)
  ============================= */
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (!prefill || !services.length || prefillApplied.current) return;
    prefillApplied.current = true;
    setSelectedPlatform(prefill.platform || "All");
    setCategory(prefill.category || "");
    setService(prefill.service || "");
    setLink(prefill.link || "");
    setQuantity(prefill.quantity || "");
  }, [location.state, services]);

  /* =============================
     DEFAULT PLATFORM
  ============================= */
  useEffect(() => {
    if (!services.length || prefillApplied.current) return;
    const globalDefault = getGlobalDefault();
    if (globalDefault) {
      setSelectedPlatform(globalDefault.platform);
      setCategory(globalDefault.category);
    } else {
      setSelectedPlatform("All");
    }
  }, [services]);

  const platformServices = useMemo(() => {
    if (selectedPlatform === "All") return services;
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  const categories = useMemo(() => {
    return [...new Set(platformServices.map((s) => s.category))];
  }, [platformServices]);

  /* =============================
     DEFAULT CATEGORY
  ============================= */
  useEffect(() => {
    if (!selectedPlatform || prefillApplied.current) return;
    if (selectedPlatform === "All") {
      setCategory(categories[0] || "");
      return;
    }
    const platformDefault = getPlatformDefault(selectedPlatform);
    if (platformDefault) {
      setCategory(platformDefault.category);
    } else {
      setCategory(categories[0] || "");
    }
  }, [selectedPlatform, categories]);

  const servicesList = useMemo(() => {
    return platformServices.filter((s) => s.category === category);
  }, [platformServices, category]);

  /* =============================
     DEFAULT SERVICE
  ============================= */
  useEffect(() => {
    if (!servicesList.length || prefillApplied.current) return;
    const defaultService = servicesList.find((s) => s.isDefault) || servicesList[0];
    setService(defaultService.name);
  }, [servicesList]);

  const selectedServiceData = useMemo(() => {
    return servicesList.find((s) => s.name === service) || null;
  }, [service, servicesList]);

  // Reset comments when service changes
  useEffect(() => {
    setComments("");
  }, [service]);

  const commentLines = comments
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /* =============================
     CHARGE CALCULATION
  ============================= */
  const calculateChargeBackend = async (qty, serviceName) => {
    if (!qty || !serviceName) { setCharge(0); return; }
    try {
      const res = await API.post("/orders/preview", {
        service: serviceName,
        quantity: Number(qty),
      });
      setCharge(res.data?.finalCharge ? Number(res.data.finalCharge).toFixed(4) : 0);
    } catch {
      setCharge(0);
      toast.error("Failed to calculate charge");
    }
  };

  const calculateChargeDebounced = useCallback(
    debounce((qty, serviceName) => { calculateChargeBackend(qty, serviceName); }, 200),
    []
  );

  useEffect(() => {
    if (service && selectedServiceData) {
      if (selectedServiceData.isFree) {
        setCharge(0);
      } else if (isCustomComments(selectedServiceData)) {
        // For custom comments, quantity = number of comment lines
        if (commentLines.length > 0) {
          calculateChargeDebounced(commentLines.length, service);
        } else {
          setCharge(0);
        }
      } else if (quantity) {
        calculateChargeDebounced(quantity, service);
      } else {
        setCharge(0);
      }
    } else {
      setCharge(0);
    }
  }, [service, quantity, comments, selectedServiceData]);

  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  /* =============================
     SUBMIT ORDER
  ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) return toast.error("User not logged in");
    if (!category || !service || !link) return toast.error("Please fill in all fields");

    const customCommentsService = isCustomComments(selectedServiceData);

    if (customCommentsService) {
      if (commentLines.length === 0)
        return toast.error("Please enter at least one comment");
      if (commentLines.length < selectedServiceData?.min)
        return toast.error(`Minimum ${selectedServiceData?.min} comments required`);
      if (commentLines.length > selectedServiceData?.max)
        return toast.error(`Maximum ${selectedServiceData?.max} comments allowed`);
    } else {
      if (!quantity) return toast.error("Please enter quantity");
      if (quantity < selectedServiceData?.min || quantity > selectedServiceData?.max)
        return toast.error(`Quantity must be between ${selectedServiceData?.min} and ${selectedServiceData?.max}`);
    }

    try {
      await API.post("/orders", {
        userId: user._id,
        category,
        service,
        link,
        quantity: customCommentsService ? commentLines.length : Number(quantity),
        comments: customCommentsService ? comments.trim() : "",
      });

      toast.success("Order placed successfully");
      setLink("");
      setQuantity("");
      setComments("");
      setCharge(0);
    } catch (err) {
      return toast.error(err.response?.data?.message || "Order failed");
    }

    try {
      const res = await API.get("/users/profile");
      setUser(res.data);
    } catch {
      console.log("Profile refresh failed, but order is fine");
    }
  };

  const customCommentsService = isCustomComments(selectedServiceData);

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto p-4">
        <InfoBanner />

        <CategoryIcons
          categoriesGrid={categoriesGrid}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={(platform) => {
            setSelectedPlatform(platform);
            setCategory("");
            setService("");
            setComments("");
            prefillApplied.current = false;
          }}
        />

        <h2 className="text-xl font-bold m-4 p-2 mx-8 bg-green-400 text-center rounded-2xl">
          New Order
        </h2>

        <form onSubmit={handleSubmit}>
          <CategorySelect
            category={category}
            setCategory={(val) => {
              setCategory(val);
              prefillApplied.current = false;
            }}
            filteredCategories={categories}
            services={services}
            selectedPlatform={selectedPlatform}
          />

          <ServiceSelect
            service={service}
            setService={(val) => {
              setService(val);
              prefillApplied.current = false;
            }}
            servicesList={servicesList}
            selectedServiceData={selectedServiceData}
          />

          {selectedServiceData?.isFree && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow">
                🎁 FREE SERVICE
              </span>
            </div>
          )}

          {/* LINK */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Link</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {/* CUSTOM COMMENTS BOX */}
          {customCommentsService ? (
            <div className="mb-4">
              <label className="font-semibold block mb-1">
                Comments
                <span className="text-xs font-normal text-gray-500 ml-2">(1 per line)</span>
              </label>
              <textarea
                className="p-3 w-[90%] rounded-xl shadow resize-y min-h-[120px] font-mono text-sm"
                placeholder={`Write one comment per line:\nGreat content!\nKeep it up!\nLove this!`}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              {/* Live counter */}
              <div className="mt-1 w-[90%] flex justify-between text-xs text-gray-500">
                <span>
                  {commentLines.length} comment{commentLines.length !== 1 ? "s" : ""}
                  {selectedServiceData && (
                    <span className="ml-1 text-gray-400">
                      (min {selectedServiceData.min} / max {selectedServiceData.max})
                    </span>
                  )}
                </span>
                {commentLines.length > 0 && commentLines.length < (selectedServiceData?.min || 0) && (
                  <span className="text-red-500">Need {selectedServiceData.min - commentLines.length} more</span>
                )}
                {commentLines.length > (selectedServiceData?.max || Infinity) && (
                  <span className="text-red-500">{commentLines.length - selectedServiceData.max} too many</span>
                )}
              </div>
            </div>
          ) : (
            /* REGULAR QUANTITY */
            <div className="mb-4">
              <label className="font-semibold block mb-1">Quantity</label>
              <input
                type="number"
                className="p-3 w-[90%] rounded-xl shadow"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!selectedServiceData}
              />
            </div>
          )}

          {/* CHARGE */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Charge (USD)</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
              value={selectedServiceData?.isFree ? "FREE" : charge}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-[90%] bg-green-600 text-white p-3 rounded-xl font-bold mb-20"
            disabled={!selectedServiceData || (!customCommentsService && !quantity)}
          >
            {selectedServiceData?.isFree ? "Claim Free Service" : "Place Order"}
          </button>
        </form>
      </main>

      <Footer />
      <FloatingSupport />
    </div>
  );
};

export default Home;
