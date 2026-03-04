import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useServices } from "../context/ServicesContext";

import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";
      setService("");
      return;
    }

    const defaultService =
      servicesList.findimport { useState, useEffect, useMemo, useCallback } from "react";
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

const Home = () => {
  const { user, setUser } = useAuth();
  const { services, loading, getGlobalDefault, getPlatformDefault } =
    useServices();

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [charge, setCharge] = useState(0);

  const categoriesGrid = [
    { name: "All",},
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

  useEffect(() => {
    if (!services.length) return;

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

  useEffect(() => {
    if (!selectedPlatform) return;

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

  useEffect(() => {
    if (!servicesList.length) {
      setService("");
      return;
    }

    const defaultService =
      servicesList.find((s) => s.isDefault) || servicesList[0];

    setService(defaultService.name);
  }, [servicesList]);

  const selectedServiceData = useMemo(() => {
    return servicesList.find((s) => s.name === service) || null;
  }, [service, servicesList]);

  // =============================
  // CHARGE CALCULATION
  // =============================
  const calculateChargeBackend = async (qty, serviceName) => {
    if (!qty || !serviceName) {
      setCharge(0);
      return;
    }

    try {
      const res = await API.post("/orders/preview", {
        service: serviceName,
        quantity: Number(qty),
      });

      setCharge(
        res.data?.finalCharge
          ? Number(res.data.finalCharge).toFixed(4)
          : 0
      );
    } catch {
      setCharge(0);
      toast.error("Failed to calculate charge");
    }
  };

  const calculateChargeDebounced = useCallback(
    debounce((qty, serviceName) => {
      calculateChargeBackend(qty, serviceName);
    }, 200),
    []
  );

  useEffect(() => {
    if (service && quantity && selectedServiceData) {
      if (selectedServiceData.isFree) {
        setCharge(0);
      } else {
        calculateChargeDebounced(quantity, service);
      }
    } else {
      setCharge(0);
    }
  }, [service, quantity, selectedServiceData]);

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // =============================
  // SUBMIT ORDER
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) return toast.error("User not logged in");
    if (!category || !service || !link || !quantity)
      return toast.error("Please fill in all fields");

    if (
      quantity < selectedServiceData?.min ||
      quantity > selectedServiceData?.max
    )
      return toast.error(
        `Quantity must be between ${selectedServiceData?.min} and ${selectedServiceData?.max}`
      );

    try {
      await API.post("/orders", {
        userId: user._id,
        category,
        service,
        link,
        quantity: Number(quantity),
      });

      toast.success("Order placed successfully");

      setLink("");
      setQuantity("");
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
          }}
        />

        <h2 className="text-xl font-bold m-4 p-2 mx-8 bg-green-400 text-center rounded-2xl">
          New Order
        </h2>

        <form onSubmit={handleSubmit}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            filteredCategories={categories}
          />

          <ServiceSelect
            service={service}
            setService={setService}
            servicesList={servicesList}
            selectedServiceData={selectedServiceData}
          />

          {/* 🔥 FREE BADGE */}
          {selectedServiceData?.isFree && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow">
                🎁 FREE SERVICE
              </span>
            </div>
          )}

          <div className="mb-4">
            <label className="font-semibold block mb-1">Link</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

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

          <div className="mb-4">
            <label className="font-semibold block mb-1">
              Charge (USD)
            </label>
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
            disabled={!selectedServiceData || !quantity}
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
