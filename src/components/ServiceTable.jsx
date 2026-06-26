// src/components/ServiceTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import formatNumber from "../utils/formatNumber";
import ServiceDescriptionModal from "./ServiceDescriptionModal";
import API from "../api/axios";

const FEATURE_STYLES = {
  orange: {
    emoji:  "⭐",
    filter: "drop-shadow(0 0 5px rgba(250,204,21,0.95)) drop-shadow(0 0 10px rgba(250,204,21,0.6))",
    headerBg:     "bg-orange-50",
    headerBorder: "border-orange-200",
    headerText:   "text-orange-700",
  },
  blue: {
    emoji:  "🔵",
    filter: "drop-shadow(0 0 6px rgba(59,130,246,0.95)) drop-shadow(0 0 12px rgba(59,130,246,0.6))",
    headerBg:     "bg-blue-50",
    headerBorder: "border-blue-200",
    headerText:   "text-blue-700",
  },
};

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

  const getCategoryStyle = (platform, category) => {
    const meta = metaMap[`${platform}::${category}`];
    if (!meta?.isFeatured) return null;
    return FEATURE_STYLES[meta.featuredColor ?? "orange"] ?? FEATURE_STYLES.orange;
  };

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

              const fStyle = getCategoryStyle(service.platform || "General", service.category);

              return (
                <React.Fragment key={service._id}>

                  {/* CATEGORY HEADER ROW */}
                  {showCategory && (
                    <tr
                      className={`border-t ${
                        fStyle
                          ? `${fStyle.headerBg} ${fStyle.headerBorder}`
                          : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <td
                        colSpan="6"
                        className={`px-3 py-2 font-semibold ${
                          fStyle ? fStyle.headerText : "text-orange-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {fStyle && (
                            <span
                              className="text-sm animate-pulse"
                              style={{ filter: fStyle.filter }}
                            >
                              {fStyle.emoji}
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
                      {service.name}
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
