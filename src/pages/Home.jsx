import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axios";
import toast from "react-hot-toast";

const Home = () => {
  const { user, setUser } = useAuth();

  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [charge, setCharge] = useState(0);
  const [servicesList, setServicesList] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedServiceData, setSelectedServiceData] = useState(null);

  // Categories with icons
  const categoriesGrid = [
    { name: "TikTok", icon: "tiktok" },
    { name: "Instagram", icon: "instagram" },
    { name: "YouTube", icon: "youtube" },
    { name: "Facebook", icon: "facebook" },
    { name: "Telegram", icon: "telegram" },
    { name: "X/Twitter", icon: "x-twitter" },
    { name: "LinkedIn", icon: "linkedin" },
    { name: "Snapchat", icon: "snapchat" },
    { name: "Spotify", icon: "spotify" },
  ];

  // Fetch categories dynamically
  useEffect(() => {
    API.get("/services")
      .then((res) => {
        const data = res.data || [];
        const uniqueCategories = [...new Set(data.map((s) => s.category))];
        setCategoriesData(uniqueCategories);
      })
      .catch(() => toast.error("Failed to fetch categories"));
  }, []);

  // Fetch services when category changes
  useEffect(() => {
    if (!category) {
      setServicesList([]);
      setService("");
      setSelectedServiceData(null);
      return;
    }

    API.get(`/services?category=${category}`)
      .then((res) => {
        const services = res.data || [];
        setServicesList(services);
        if (services.length > 0) {
          setService(services[0].name);
          setSelectedServiceData(services[0]);
        } else {
          setService("");
          setSelectedServiceData(null);
        }
        setQuantity("");
        setCharge(0);
      })
      .catch(() => {
        setServicesList([]);
        setService("");
        setSelectedServiceData(null);
        setQuantity("");
        setCharge(0);
      });
  }, [category]);

  // Update selected service details
  useEffect(() => {
    const selected = servicesList.find((s) => s.name === service) || null;
    setSelectedServiceData(selected);
    setQuantity("");
    setCharge(0);
  }, [service, servicesList]);

  // ==================== CALCULATE CHARGE (backend) ====================
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
      setCharge(res.data?.finalCharge ? Number(res.data.finalCharge).toFixed(2) : 0);
    } catch (err) {
      console.error("Failed to calculate charge", err);
      setCharge(0);
      toast.error("Failed to calculate charge");
    }
  };

  // ==================== DEBOUNCE HELPER ====================
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const calculateChargeDebounced = useCallback(
    debounce((qty, serviceName) => {
      calculateChargeBackend(qty, serviceName);
    }, 150),
    []
  );

  useEffect(() => {
    if (service && quantity && selectedServiceData) {
      calculateChargeDebounced(quantity, service);
    } else {
      setCharge(0);
    }
  }, [service, quantity, selectedServiceData, calculateChargeDebounced]);

  // ==================== SUBMIT ORDER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) return toast.error("User not logged in");
    if (!category || !service || !link || !quantity)
      return toast.error("Please fill in all fields");

    if (quantity < selectedServiceData?.min || quantity > selectedServiceData?.max)
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

      // Update user balance
      const res = await API.get("/users/profile");
      const updatedUser = res.data;
      if (setUser) setUser(updatedUser);

      toast.success("Order placed successfully");

      // Reset form
      setCategory("");
      setService("");
      setLink("");
      setQuantity("");
      setCharge(0);
      setServicesList([]);
      setSelectedServiceData(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  }

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto p-4">
        {/* Info Banner */}
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4">
          <strong>Marine Panel</strong> is the best and cheapest SMM panel  
      currently, trusted by influencers, businesses, agencies, freelancers,  
      and resellers. We deliver real engagement, instant results, and  
      high-quality SMM services for Facebook, Instagram, YouTube, TikTok,  
      Telegram, X/Twitter and more.
        </div>

        {/* Category Grid */}
        <h2 className="bg-gray-100 p-2 rounded-xl font-bold text-lg text-center mb-2">
          Choose a Social Account
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {categoriesGrid.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={`bg-white rounded-2xl p-2 shadow flex items-center gap-2 ${
                category === cat.name ? "ring-2 ring-green-500" : ""
              }`}
            >
              <i className={`fa-brands fa-${cat.icon} text-xl`}></i>
              <span className="text-sm font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* New Order */}
        <h2 className="text-xl font-bold m-4 p-2 mx-8 bg-green-400 text-center rounded-2xl ">
          New Order
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Category Dropdown */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Category</label>
            <select
              className="p-3 w-[90%] rounded-xl shadow"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categoriesData.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Service Dropdown */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Service</label>
            <select
              className="p-3 w-[90%] rounded-xl shadow"
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={servicesList.length === 0}
            >
              <option value="">Select service</option>
              {servicesList.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
              rows={3}
              value={selectedServiceData?.description || ""}
              readOnly
              placeholder="Service description will appear here"
            />
          </div>

          {/* Min / Max */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Min / Max Order</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
              value={
                selectedServiceData
                  ? `Min: ${selectedServiceData.min} | Max: ${selectedServiceData.max}`
                  : ""
              }
              readOnly
            />
          </div>

          {/* Link */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Link</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow"
              placeholder="Enter link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Quantity</label>
            <input
              type="number"
              min={selectedServiceData?.min || 0}
              max={selectedServiceData?.max || 1000000}
              className="p-3 w-[90%] rounded-xl shadow"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedServiceData}
            />
          </div>

          {/* Charge */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">Charge ($)</label>
            <input
              type="text"
              className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
              value={charge}
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-[90%] bg-green-600 text-white p-3 rounded-xl font-bold mb-20"
            disabled={!selectedServiceData || !quantity}
          >
            Place Order
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Home;