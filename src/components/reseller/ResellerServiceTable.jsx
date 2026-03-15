// src/components/reseller/ResellerServiceTable.jsx
import React from "react";
import formatNumber from "../../utils/formatNumber";

const ResellerServiceTable = ({ services, toggleVisibility, updateService }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        No services available
      </div>
    );
  }

  let lastCategory = null;

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto text-[11px] border border-gray-200">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left min-w-[220px]">Service</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-3 py-2 text-left">Min</th>
              <th className="px-3 py-2 text-left">Max</th>
              <th className="px-3 py-2 text-left">Visible</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service, index) => {
              const showCategory = service.category !== lastCategory;
              lastCategory = service.category;

              // Use backend finalPrice for reseller
              const resellerRate = Number(service.finalPrice || 0);

              return (
                <React.Fragment key={service._id || service.serviceId}>

                  {/* CATEGORY ROW */}
                  {showCategory && (
                    <tr className="bg-orange-50 border-t border-orange-200">
                      <td colSpan="6" className="px-3 py-2 font-semibold text-orange-700">
                        <input
                          type="text"
                          defaultValue={service.category}
                          onBlur={(e) => {
                            const newCategory = e.target.value.trim();
                            if (newCategory && newCategory !== service.category) {
                              updateService(service._id, null, newCategory);
                            }
                          }}
                          className="bg-transparent border-b border-orange-300 focus:outline-none w-full"
                        />
                      </td>
                    </tr>
                  )}

                  {/* SERVICE ROW */}
                  <tr
                    className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    {/* ID */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {service.serviceId || service._id}
                    </td>

                    {/* SERVICE NAME */}
                    <td className="px-3 py-2 text-gray-800">
                      <input
                        type="text"
                        defaultValue={service.name}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== service.name) {
                            updateService(service._id, newName, null);
                          }
                        }}
                        className="border rounded px-2 py-[2px] w-full text-[11px]"
                      />
                    </td>

                    {/* RESELLER PRICE */}
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-green-600">
                      ${resellerRate.toFixed(4)}
                    </td>

                    {/* MIN */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.min)}
                    </td>

                    {/* MAX */}
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {formatNumber(service.max)}
                    </td>

                    {/* VISIBILITY (per reseller) */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={service.visible}
                        onChange={(e) => toggleVisibility(service._id, e.target.checked)}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ResellerServiceTable;
