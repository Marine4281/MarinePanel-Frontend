// src/components/ServiceTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import formatNumber from "../utils/formatNumber";
import ServiceDescriptionModal from "./ServiceDescriptionModal";
import API from "../api/axios";

const ServiceTable = ({ services }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  // Fetch category meta for sort order + featured flags
  useEffect(() => {
    API.get("/category-meta")
      .then((res) => setCategoryMeta(res.data || []))
      .catch(() => setCategoryMeta([]));
  }, []);

  // Build lookup: "Platform::Category" → { sortOrder, isFeatured }
  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => {
      m[`${c.platform}::${c.category}`] = c;
    });
    return m;
  }, [categoryMeta]);

  const isFeatured = (platform, category) =>
    metaMap[`${platform}::${category}`]?.isFeatured ?? false;

  const getSortOrder = (platform, category) =>
    metaMap[`${platform}::${category}`]?.sortOrder ?? 999;

  // Group services by platform → category, respecting sortOrder
  const groupedServices = useMemo(() => {
    if (!services?.length) return [];

    // Group by platform
    const byPlatform = {};
    services.forEach((s) => {
      const p = s.platform || "General";
      if (!byPlatform[p]) byPlatform[p] = {};
      if (!byPlatform[p][s.category]) byPlatform[p][s.category] = [];
      byPlatform[p][s.category].push(s);
    });

    // Flatten into sorted rows
    const rows = [];
    Object.entries(byPlatform).forEach(([platform, categories]) => {
      const sortedCats = Object.entries(categories).sort(([catA], [catB]) => {
        return getSortOrder(platform, catA) - getSortOrder(platform, catB);
      });
      sortedCats.forEach(([category, items]) => {
        rows.push({ platform, category, items, featured: isFeatured(platform, category) });
      });
    });

    return rows;
  }, [services, metaMap]);

  const calculateRate = (service) => {
    if (service?.resellerRate != null) return Number(service.resellerRate).toFixed(4);
    if (service?.systemRate != null) return Number(service.systemRate).toFixed(4);
    if (service?.rate != null) return Number(service.rate).toFixed(4);
    return "0.0000";
  };

  if (!services || services.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        No services available
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto text-[11px] border border-gray-200">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left min-w-[200px]">Service</th>
              <th className="px-3 py-2 text-left">Rate</th>
              <th className="px-3 py-2 text-left">Min</th>
              <th className="px-3 py-2 text-left">Max</th>
              <th className="px-3 py-2 text-left">Info</th>
            </tr>
          </thead>

          <tbody>
            {groupedServices.map(({ platform, category, items, featured }) => (
              <React.Fragment key={`${platform}::${category}`}>

                {/* CATEGORY HEADER ROW */}
                <tr className="bg-orange-50 border-t border-orange-200">
                  <td colSpan="6" className="px-3 py-2 font-semibold text-orange-700">
                    <span className="flex items-center gap-2">
                      {featured && (
                        <span
                          className="text-yellow-400 text-sm animate-pulse"
                          style={{
                            filter:
                              "drop-shadow(0 0 5px rgba(250,204,21,0.95)) drop-shadow(0 0 10px rgba(250,204,21,0.6))",
                          }}
                        >
                          ⭐
                        </span>
                      )}
                      {category}
                    </span>
                  </td>
                </tr>

                {/* SERVICE ROWS */}
                {items.map((service, index) => (
                  <tr
                    key={service._id}
                    className={`border-t hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* ID */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {service.serviceId || service._id}
                    </td>

                    {/* SERVICE NAME */}
                    <td className="px-3 py-2 text-gray-800 leading-snug whitespace-normal break-words max-w-[320px] md:max-w-full">
                      <div className="md:hidden">
                        {service.name?.split("~").map((part, idx) => (
                          <div key={idx}>{idx === 0 ? part.trim() : `~ ${part.trim()}`}</div>
                        ))}
                      </div>
                      <div className="hidden md:block">
                        {service.name?.replace(/\n/g, " ").replace(/\s+/g, " ").trim()}
                      </div>
                    </td>

                    {/* RATE */}
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-green-600">
                      ${calculateRate(service)}
                    </td>

                    {/* MIN */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.min)}
                    </td>

                    {/* MAX */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.max)}
                    </td>

                    {/* INFO */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

              </React.Fragment>
            ))}
          </tbody>

        </table>
      </div>

      {/* DESCRIPTION MODAL */}
      {selectedService && (
        <ServiceDescriptionModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default ServiceTable;
