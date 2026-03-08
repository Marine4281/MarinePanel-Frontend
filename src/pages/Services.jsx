// src/pages/Services.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // <--- import useNavigate
import API from "../api/axios";
import ServiceTable from "../components/ServiceTable";
import CategoryIcons from "../components/CategoryIcons";

const Services = () => {
  const navigate = useNavigate(); // <--- initialize navigate
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected platform for filtering
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  // Search input
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Global commission
  const [commission, setCommission] = useState(0);

  // Platform icons / grid
  const categoriesGrid = [
    { name: "All", icon: "grid" },
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

  // Fetch services and commission
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, commissionRes] = await Promise.all([
          API.get("/services"),
          API.get("/admin/settings/commission"),
        ]);

        setServices(servicesRes.data || []);
        setCommission(commissionRes.data?.commission || 0);
      } catch (err) {
        console.error("Failed to load services or commission", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =============================
  // Debounce search input
  // =============================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms debounce delay
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter services based on selected platform
  const platformFiltered = useMemo(() => {
    if (selectedPlatform === "All") return services;
    return services.filter(
      (s) =>
        (s.platform || "").toString().toLowerCase() ===
        selectedPlatform.toLowerCase()
    );
  }, [services, selectedPlatform]);

  // Further filter based on debounced search term
  const filteredServices = useMemo(() => {
    if (!debouncedSearch.trim()) return platformFiltered;

    const lowerSearch = debouncedSearch.toLowerCase();
    return platformFiltered.filter((s) => {
      const serviceId = (s.serviceId || "").toString().toLowerCase();
      const name = (s.name || "").toLowerCase();
      const category = (s.category || "").toLowerCase();

      return (
        serviceId.includes(lowerSearch) ||
        name.includes(lowerSearch) ||
        category.includes(lowerSearch)
      );
    });
  }, [platformFiltered, debouncedSearch]);

  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 text-center text-gray-500">
        Loading services...
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">

      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)} // <--- go back
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow-sm text-sm transition"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
        Services
      </h1>

      {/* Category / Platform Icons */}
      <CategoryIcons
        categoriesGrid={categoriesGrid}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={(platform) => setSelectedPlatform(platform)}
      />

      {/* Search input */}
      <div className="my-4 w-full max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by ID, Name or Category"
          className="w-full p-3 rounded-xl shadow border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Services Table */}
      {filteredServices.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No services found for "{searchTerm || selectedPlatform}"
        </div>
      ) : (
        <ServiceTable services={filteredServices} commission={commission} />
      )}

    </div>
  );
};

export default Services;
