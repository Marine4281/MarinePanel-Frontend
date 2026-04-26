// src/components/reseller/ResellerServiceTable.jsx
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import ServiceDescriptionModal from "./ServiceDescriptionModal";

export default function ResellerServiceTable({
  services,
  commission,
  toggleVisibility,
  updateService,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [selectedService, setSelectedService] = useState(null);

  const startEdit = (service) => {
    setEditingId(service._id);
    setEditValues({
      name: service.name || "",
      categoryName: service.category || "",
    });
  };

  const saveEdit = async (service) => {
    await updateService(service._id, editValues.name, editValues.categoryName);
    setEditingId(null);
    setEditValues({});
  };

  const openDescription = (service) => setSelectedService(service);
  const closeDescription = () => setSelectedService(null);

  return (
    <>
      <table className="min-w-full text-sm bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr className="bg-orange-500 text-white text-left text-xs uppercase tracking-wide">
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Service Name</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">System Rate</th>
            <th className="px-3 py-3">Reseller Rate</th>
            <th className="px-3 py-3">Visible</th>
            <th className="px-3 py-3 text-center">Info</th>
            <th className="px-3 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                No services found.
              </td>
            </tr>
          ) : (
            services.map((service, idx) => {
              const isEditing = editingId === service._id;
              const systemRate = Number(service.systemRate || 0);
              const resellerRate = Number(service.resellerRate ?? systemRate);

              return (
                <tr
                  key={service._id}
                  className={`border-b last:border-none transition-colors ${
                    isEditing
                      ? "bg-orange-50"
                      : idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  } hover:bg-orange-50/40`}
                >
                  {/* # */}
                  <td className="px-3 py-2 text-gray-400 text-xs">{idx + 1}</td>

                  {/* ID */}
                  <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {service.serviceId || service._id}
                  </td>

                  {/* Service Name */}
                  <td className="px-3 py-2 min-w-[160px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) =>
                          setEditValues((v) => ({ ...v, name: e.target.value }))
                        }
                        className="border border-orange-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium text-xs">
                        {service.name}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2 min-w-[130px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.categoryName}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            categoryName: e.target.value,
                          }))
                        }
                        className="border border-orange-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    ) : (
                      <span className="text-gray-600 text-xs">
                        {service.category || "—"}
                      </span>
                    )}
                  </td>

                  {/* System Rate */}
                  <td className="px-3 py-2 text-gray-700 text-xs whitespace-nowrap">
                    ${systemRate.toFixed(6)}
                  </td>

                  {/* Reseller Rate */}
                  <td className="px-3 py-2 text-orange-500 font-semibold text-xs whitespace-nowrap">
                    ${resellerRate.toFixed(6)}
                  </td>

                  {/* Visible toggle */}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleVisibility(service._id, !service.visible)}
                      title={service.visible ? "Hide service" : "Show service"}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition ${
                        service.visible
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {service.visible ? (
                        <>
                          <FiEye size={11} /> On
                        </>
                      ) : (
                        <>
                          <FiEyeOff size={11} /> Off
                        </>
                      )}
                    </button>
                  </td>

                  {/* INFO */}
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => openDescription(service)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] transition"
                    >
                      Info
                    </button>
                  </td>

                  {/* ACTION — Edit / Save */}
                  <td className="px-3 py-2 text-center">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(service)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(service)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-[3px] rounded text-[10px] font-medium transition"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {selectedService && (
        <ServiceDescriptionModal
          service={selectedService}
          onClose={closeDescription}
        />
      )}
    </>
  );
                            }
