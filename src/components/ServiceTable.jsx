// src/components/ServiceTable.jsx
import React, { useState } from "react";
import formatNumber from "../utils/formatNumber";
import ServiceDescriptionModal from "./ServiceDescriptionModal";

const ServiceTable = ({ services }) => {
  const [selectedService, setSelectedService] = useState(null);

  const openDescription = (service) => setSelectedService(service);
  const closeDescription = () => setSelectedService(null);

  if (!services || services.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        No services available
      </div>
    );
  }

  // ✅ FINAL: NO FRONTEND COMMISSION CALCULATION
  const calculateRate = (service) => {
    // 1. Reseller price (highest priority)
    if (service?.resellerRate !== undefined && service?.resellerRate !== null) {
      return Number(service.resellerRate).toFixed(4);
    }

    // 2. Admin/system price
    if (service?.systemRate !== undefined && service?.systemRate !== null) {
      return Number(service.systemRate).toFixed(4);
    }

    // 3. Fallback (already processed from backend)
    if (service?.rate !== undefined && service?.rate !== null) {
      return Number(service.rate).toFixed(4);
    }

    return "0.0000";
  };

  let lastCategory = null;

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
            {services.map((service, index) => {
              const showCategory = service.category !== lastCategory;
              lastCategory = service.category;

              return (
                <React.Fragment key={service._id}>

                  {/* CATEGORY ROW */}
                  {showCategory && (
                    <tr className="bg-orange-50 border-t border-orange-200">
                      <td
                        colSpan="6"
                        className="px-3 py-2 font-semibold text-orange-700"
                      >
                        {service.category}
                      </td>
                    </tr>
                  )}

                  {/* SERVICE ROW */}
                  <tr
                    className={`border-t hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >

                    {/* ID */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {service.serviceId || service._id}
                    </td>

                    {/* SERVICE */}
                    <td className="px-3 py-2 text-gray-800 leading-snug whitespace-normal break-words max-w-[320px] md:max-w-full">

                      {/* Mobile */}
                      <div className="md:hidden">
                        {service.name?.split("~").map((part, idx) => (
                          <div key={idx}>
                            {idx === 0 ? part.trim() : `~ ${part.trim()}`}
                          </div>
                        ))}
                      </div>

                      {/* Desktop */}
                      <div className="hidden md:block">
                        {service.name
                          ?.replace(/\n/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()}
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
                        onClick={() => openDescription(service)}
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

      {/* MODAL */}
      {selectedService && (
        <ServiceDescriptionModal
          service={selectedService}
          onClose={closeDescription}
        />
      )}
    </div>
  );
};

export default ServiceTable;
