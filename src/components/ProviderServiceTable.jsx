import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function ProviderServiceTable({
  services: fetchedServices = [],
  provider,
}) {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState([]);

  const loadSavedServices = async () => {
    try {
      const { data } = await API.get("/provider/services/saved");
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSavedServices();
  }, []);

  useEffect(() => {
    if (fetchedServices.length > 0) {
      setServices(fetchedServices);
    }
  }, [fetchedServices]);

  const toggleService = async (id) => {
    try {
      await API.patch(`/provider/services/${id}/toggle`);
      toast.success("Service status updated");
      loadSavedServices();
    } catch {
      toast.error("Failed to update service");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await API.delete(`/provider/services/${id}`);
      toast.success("Service deleted");
      loadSavedServices();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* -------------------------
     Selection Logic
  ------------------------- */

  const getId = (service) =>
    service.service || service.providerServiceId;

  const toggleSelect = (service) => {
    const id = getId(service);

    const exists = selected.find((s) => getId(s) === id);

    if (exists) {
      setSelected(selected.filter((s) => getId(s) !== id));
    } else {
      setSelected([...selected, service]);
    }
  };

  const selectCategory = (items) => {
    const newSelected = [...selected];

    items.forEach((item) => {
      const id = getId(item);

      if (!newSelected.find((s) => getId(s) === id)) {
        newSelected.push(item);
      }
    });

    setSelected(newSelected);
  };

  /* -------------------------
     Import Selected
  ------------------------- */

  const importSelected = async () => {
    if (selected.length === 0) {
      toast.error("No services selected");
      return;
    }

    try {
      await API.post("/provider/import-selected", {
        provider,
        services: selected.map((s) => ({
          service: getId(s),
          name: s.name,
          category: s.category,
          rate: Number(s.rate),
          min: Number(s.min),
          max: Number(s.max),
        })),
      });

      toast.success("Selected services imported");

      setSelected([]);

      loadSavedServices();
    } catch {
      toast.error("Import failed");
    }
  };

  /* -------------------------
     Import Category
  ------------------------- */

  const importCategory = async (category, items) => {
    try {
      await API.post("/provider/import-category", {
        provider,
        category,
        services: items.map((s) => ({
          service: getId(s),
          name: s.name,
          category: s.category,
          rate: Number(s.rate),
          min: Number(s.min),
          max: Number(s.max),
        })),
      });

      toast.success(`${category} imported`);

      loadSavedServices();
    } catch {
      toast.error("Category import failed");
    }
  };

  const grouped = services.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="bg-white shadow rounded-lg p-4">

      {/* Import Selected Button */}

      {selected.length > 0 && (
        <div className="mb-4">
          <button
            onClick={importSelected}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Import Selected ({selected.length})
          </button>
        </div>
      )}

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500">No services found</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-6">

          {/* Category Header */}

          <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h2 className="text-lg font-semibold">{category}</h2>

            <div className="flex gap-2">

              <button
                onClick={() => selectCategory(items)}
                className="bg-gray-200 px-3 py-1 rounded text-sm"
              >
                Select Category
              </button>

              <button
                onClick={() => importCategory(category, items)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Import Category
              </button>

            </div>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2"></th>
                <th className="p-2 text-left">Service</th>
                <th className="p-2">Rate</th>
                <th className="p-2">Min</th>
                <th className="p-2">Max</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((service) => {

                const id = getId(service);

                const checked = selected.find((s) => getId(s) === id);

                return (
                  <tr
                    key={service._id || id}
                    className="border-t"
                  >

                    {/* Checkbox */}

                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={!!checked}
                        onChange={() => toggleSelect(service)}
                      />
                    </td>

                    <td className="p-2">{service.name}</td>

                    <td className="text-center">{service.rate}</td>

                    <td className="text-center">{service.min}</td>

                    <td className="text-center">{service.max}</td>

                    <td className="text-center">
                      {service._id ? (
                        <button
                          onClick={() => toggleService(service._id)}
                          className={`px-3 py-1 rounded text-white ${
                            service.status
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {service.status ? "Enabled" : "Disabled"}
                        </button>
                      ) : (
                        <span className="text-gray-400">Not saved</span>
                      )}
                    </td>

                    <td className="text-center">
                      {service._id && (
                        <button
                          onClick={() => deleteService(service._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
    }
