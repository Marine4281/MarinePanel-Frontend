// src/components/ServiceTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import formatNumber from "../utils/formatNumber";
import ServiceDescriptionModal from "./ServiceDescriptionModal";
import API from "../api/axios";

const ServiceTable = ({ services }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [categoryMeta, setCategoryMeta] = useState([]);

  useEffect(() => {
    API.get("/category-meta")
      .then((res) => setCategoryMeta(res.data || []))
      .catch(() => setCategoryMeta([]));
  }, []);

  const metaMap = useMemo(() => {
    const m = {};
    categoryMeta.forEach((c) => {
      m[`${c.platform}::${c.category}`] = c;
    });
    return m;
  }, [categoryMeta]);

  const isFeatured = (platform, category) =>
    metaMap[`${platform}::${category}`]?.isFeatured ?? false;

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

  // Original logic — no sorting, just track category changes
  let lastCategory = null;
  let lastPlatform = null;

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto text-[11px] border border-gray-200">

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
            {services.map((service, index) => {
              const showCategory =
                service.category !== lastCategory ||
                service.platform !== lastPlatform;
              lastCategory = service.category;
              lastPlatform = service.platform;

              const featured = isFeatured(service.platform || "General", service.category);

              return (
                <React.Fragment key={service._id}>

                  {/* CATEGORY HEADER ROW */}
                  {showCategory && (
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
                          {service.category}
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* SERVICE ROW */}
                  <tr
                    className={`border-t hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {service.serviceId || service._id}
                    </td>

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

                    <td className="px-3 py-2 whitespace-nowrap font-medium text-green-600">
                      ${calculateRate(service)}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.min)}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.max)}
                    </td>

                    <td className="px-3 py-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>

                </React.Fragment>
              );
            })}
          </tbody>

        </table>
      </div>

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
