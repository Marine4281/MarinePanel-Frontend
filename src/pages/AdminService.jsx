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

  // ✅ Provider system
  providerProfileId: "",
  providerServiceId: "",

  // ✅ RESTORED (important for debugging providers)
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

  // ✅ FREE SERVICE
  isFree: false,
  freeQuantity: "",
  cooldownHours: "",
};

const AdminService = () => {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(initialForm);

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

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.platform ||
      !form.category ||
      !form.name ||
      !form.providerProfileId ||
      (!form.isFree && !form.rate)
    ) {
      return toast.error("Please fill all required fields");
    }

    try {
      if (selectedService) {
        await API.put(`/admin/services/${selectedService._id}`, form);
        toast.success("Service updated successfully");
      } else {
        await API.post("/admin/services", form);
        toast.success("Service added successfully");
      }

      setForm(initialForm);
      setSelectedService(null);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save service");
    }
  };

  /* ================= EDIT ================= */
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
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      await API.delete(`/admin/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  /* ================= TOGGLE ================= */
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/admin/services/${id}/toggle`);
      toast.success("Service status updated");
      fetchServices();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-8">
          {selectedService ? "Edit Service" : "Add New Service"}
        </h2>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 mb-10 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PLATFORM */}
            <input
              name="platform"
              placeholder="Platform *"
              value={form.platform}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              required
            />

            {/* CATEGORY */}
            <input
              name="category"
              placeholder="Category *"
              value={form.category}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              required
            />

            {/* NAME */}
            <input
              name="name"
              placeholder="Service Name *"
              value={form.name}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              required
            />

            {/* PROVIDER */}
            <select
              name="providerProfileId"
              value={form.providerProfileId}
              onChange={handleChange}
              className="p-3 border rounded-lg"
              required
            >
              <option value="">Select Provider</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* PROVIDER SERVICE ID */}
            <input
              name="providerServiceId"
              placeholder="Provider Service ID"
              value={form.providerServiceId}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            {/* ✅ RESTORED API URL */}
            <input
              name="providerApiUrl"
              placeholder="Provider API URL"
              value={form.providerApiUrl}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            {/* ✅ RESTORED API KEY */}
            <input
              name="providerApiKey"
              placeholder="Provider API Key"
              value={form.providerApiKey}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            {/* RATE */}
            <input
              type="number"
              step="0.0001"
              name="rate"
              placeholder="Rate per 1000"
              value={form.rate}
              onChange={handleChange}
              disabled={form.isFree}
              className="p-3 border rounded-lg"
            />

            <input
              type="number"
              name="min"
              placeholder="Min"
              value={form.min}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="number"
              name="max"
              placeholder="Max"
              value={form.max}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          {/* FREE */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFree"
              checked={form.isFree}
              onChange={handleChange}
            />
            🎁 Free Service
          </label>

          <FreeServiceFields form={form} handleChange={handleChange} />

          {/* FLAGS */}
          <div className="flex flex-wrap gap-6 pt-4">

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="refillAllowed"
                checked={form.refillAllowed}
                onChange={handleChange}
              />
              Refill Allowed
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="cancelAllowed"
                checked={form.cancelAllowed}
                onChange={handleChange}
              />
              Cancel Allowed
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
              />
              Default Service
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefaultCategoryGlobal"
                checked={form.isDefaultCategoryGlobal}
                onChange={handleChange}
              />
              Global Default Category
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefaultCategoryPlatform"
                checked={form.isDefaultCategoryPlatform}
                onChange={handleChange}
              />
              Platform Default Category
            </label>

          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            {selectedService ? "Update Service" : "Add Service"}
          </button>
        </form>

        {/* ================= TABLE ================= */}
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
