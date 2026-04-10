// src/pages/AdminService.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import FreeServiceFields from "../components/FreeServiceFields";
import AdminServiceTable from "../components/AdminServiceTable";

const initialForm = {
  platform: "",
  category: "",
  name: "",

  providerProfileId: "",
  providerServiceId: "",

  newProviderName: "",
  providerApiUrl: "",
  providerApiKey: "",

  rate: "",
  min: "",
  max: "",
  description: "",

  refillAllowed: true,
  cancelAllowed: true,

  isDefault: false,
  isDefaultCategoryGlobal: false,
  isDefaultCategoryPlatform: false,

  isFree: false,
  freeQuantity: "",
  cooldownHours: "",
};

const AdminService = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingProvider, setEditingProvider] = useState(false);

  const isAddingNewProvider = form.providerProfileId === "new";

  const selectedProvider = providers.find(
    (p) => p._id === form.providerProfileId
  );

  /* ================= FETCH ================= */
  const fetchServices = async () => {
    try {
      const res = await API.get("/admin/services");
      setServices(res.data);
    } catch {
      toast.error("Failed to fetch services");
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await API.get("/provider/profiles");
      setProviders(res.data);
    } catch {
      toast.error("Failed to fetch providers");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchProviders();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProviderSelect = (id) => {
    setForm((prev) => ({
      ...prev,
      providerProfileId: id,
    }));
    setShowDropdown(false);
  };

  /* ================= UPDATE PROVIDER ================= */
  const handleUpdateProvider = async () => {
    try {
      await API.put(`/provider/profiles/${form.providerProfileId}`, {
        name: form.newProviderName || selectedProvider.name,
        apiUrl: form.providerApiUrl || selectedProvider.apiUrl,
        apiKey: form.providerApiKey || selectedProvider.apiKey,
      });

      toast.success("Provider updated");
      setEditingProvider(false);
      fetchProviders();
    } catch {
      toast.error("Failed to update provider");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.platform ||
      !form.category ||
      !form.name ||
      (!form.providerProfileId && !isAddingNewProvider) ||
      (!form.isFree && !form.rate)
    ) {
      return toast.error("Please fill all required fields");
    }

    try {
      let providerId = form.providerProfileId;

      if (isAddingNewProvider) {
        if (
          !form.newProviderName ||
          !form.providerApiUrl ||
          !form.providerApiKey
        ) {
          return toast.error("Fill all new provider fields");
        }

        const res = await API.post("/provider/profiles", {
          name: form.newProviderName,
          apiUrl: form.providerApiUrl,
          apiKey: form.providerApiKey,
        });

        providerId = res.data._id;
        toast.success("Provider created");
      }

      const payload = {
        ...form,
        providerProfileId: providerId,
      };

      if (selectedService) {
        await API.put(`/admin/services/${selectedService._id}`, payload);
        toast.success("Service updated");
      } else {
        await API.post("/admin/services", payload);
        toast.success("Service added");
      }

      setForm(initialForm);
      setSelectedService(null);
      fetchServices();
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  /* ================= EDIT SERVICE ================= */
  const handleEdit = (service) => {
    setSelectedService(service);

    setForm({
      ...initialForm,
      ...service,
      providerProfileId: service.providerProfileId?._id || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await API.delete(`/admin/services/${id}`);
      toast.success("Deleted");
      fetchServices();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/admin/services/${id}/toggle`);
      toast.success("Updated");
      fetchServices();
    } catch {
      toast.error("Failed to update");
    }
  };

  /* ================= FILTER ================= */
  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-8">
          {selectedService ? "Edit Service" : "Add New Service"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 mb-10 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input name="platform" placeholder="Platform *"
              value={form.platform} onChange={handleChange}
              className="p-3 border rounded-lg" required />

            <input name="category" placeholder="Category *"
              value={form.category} onChange={handleChange}
              className="p-3 border rounded-lg" required />

            <input name="name" placeholder="Service Name *"
              value={form.name} onChange={handleChange}
              className="p-3 border rounded-lg" required />

            {/* 🔥 CUSTOM PROVIDER DROPDOWN */}
            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-3 border rounded-lg bg-white cursor-pointer flex justify-between items-center"
              >
                <span>
                  {selectedProvider
                    ? selectedProvider.name
                    : "Select Provider"}
                </span>
                <span>▼</span>
              </div>

              {showDropdown && (
                <div className="absolute z-50 bg-white border rounded-lg w-full mt-2 shadow-lg max-h-60 overflow-y-auto">

                  <input
                    placeholder="Search provider..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-2 border-b outline-none"
                  />

                  {filteredProviders.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleProviderSelect(p._id)}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.apiUrl}
                      </div>
                    </div>
                  ))}

                  <div
                    onClick={() => handleProviderSelect("new")}
                    className="p-3 text-blue-600 font-semibold hover:bg-blue-50 cursor-pointer"
                  >
                    ➕ Add New Provider
                  </div>
                </div>
              )}
            </div>

            {/* 🔥 PROVIDER DETAILS */}
            {selectedProvider && !isAddingNewProvider && (
              <div className="col-span-2 bg-gray-50 p-4 rounded-xl border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{selectedProvider.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedProvider.apiUrl}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingProvider(!editingProvider)}
                    className="text-blue-600 text-sm"
                  >
                    ✏️ Edit
                  </button>
                </div>

                {editingProvider && (
                  <div className="mt-4 grid gap-3">
                    <input
                      placeholder="Name"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          newProviderName: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                    />

                    <input
                      placeholder="API URL"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          providerApiUrl: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                    />

                    <input
                      placeholder="API Key"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          providerApiKey: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                    />

                    <button
                      type="button"
                      onClick={handleUpdateProvider}
                      className="bg-green-600 text-white py-2 rounded"
                    >
                      Save Provider
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NEW PROVIDER */}
            {isAddingNewProvider && (
              <>
                <input name="newProviderName" placeholder="Provider Name"
                  value={form.newProviderName}
                  onChange={handleChange}
                  className="p-3 border rounded-lg" />

                <input name="providerApiUrl" placeholder="API URL"
                  value={form.providerApiUrl}
                  onChange={handleChange}
                  className="p-3 border rounded-lg" />

                <input name="providerApiKey" placeholder="API Key"
                  value={form.providerApiKey}
                  onChange={handleChange}
                  className="p-3 border rounded-lg" />
              </>
            )}

            <input name="providerServiceId"
              placeholder="Provider Service ID"
              value={form.providerServiceId}
              onChange={handleChange}
              className="p-3 border rounded-lg" />

            <input type="number" step="0.0001"
              name="rate"
              placeholder="Rate per 1000"
              value={form.rate}
              onChange={handleChange}
              disabled={form.isFree}
              className="p-3 border rounded-lg" />

            <input name="min" placeholder="Min"
              value={form.min}
              onChange={handleChange}
              className="p-3 border rounded-lg" />

            <input name="max" placeholder="Max"
              value={form.max}
              onChange={handleChange}
              className="p-3 border rounded-lg" />
          </div>

          <textarea name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg" />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
            {selectedService ? "Update Service" : "Add Service"}
          </button>
        </form>

        <AdminServiceTable
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
};

export default AdminService;
