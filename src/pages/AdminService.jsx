import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const AdminService = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    provider: "",
    providerApiUrl: "",
    providerServiceId: "",
    providerApiKey: "",
    rate: "",
    min: "",
    max: "",
    description: "",
    refillAllowed: true,
    cancelAllowed: true,
    isDefault: false,
  });

  // Fetch all services
  const fetchServices = async () => {
    try {
      const res = await API.get("/admin/services");
      setServices(res.data);
    } catch {
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Add / Update service
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedService) {
        await API.put(`/admin/services/${selectedService._id}`, form);
        toast.success("Service updated");
      } else {
        await API.post("/admin/services", form);
        toast.success("Service added");
      }

      // Reset form
      setForm({
        name: "",
        category: "",
        provider: "",
        providerApiUrl: "",
        providerServiceId: "",
        providerApiKey: "",
        rate: "",
        min: "",
        max: "",
        description: "",
        refillAllowed: true,
        cancelAllowed: true,
        isDefault: false,
      });
      setSelectedService(null);
      fetchServices();
    } catch {
      toast.error("Failed to save service");
    }
  };

  // Handle Edit
  const handleEdit = (service) => {
    setSelectedService(service);
    setForm({
      name: service.name || "",
      category: service.category || "",
      provider: service.provider || "",
      providerApiUrl: service.providerApiUrl || "",
      providerServiceId: service.providerServiceId || "",
      providerApiKey: service.providerApiKey || "",
      rate: service.rate || "",
      min: service.min || "",
      max: service.max || "",
      description: service.description || "",
      refillAllowed: service.refillAllowed ?? true,
      cancelAllowed: service.cancelAllowed ?? true,
      isDefault: service.isDefault ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await API.delete(`/admin/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">
          {selectedService ? "Edit Service" : "Add New Service"}
        </h2>

        {/* Service Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Service Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Instagram Followers Real"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Editable Category */}
            <div>
              <label className="block font-medium mb-1">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter category"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Editable Provider */}
            <div>
              <label className="block font-medium mb-1">Provider</label>
              <input
                name="provider"
                value={form.provider}
                onChange={handleChange}
                placeholder="Enter provider name"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Provider API URL</label>
              <input
                name="providerApiUrl"
                value={form.providerApiUrl}
                onChange={handleChange}
                placeholder="https://api.provider.com/order"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Provider Service ID</label>
              <input
                name="providerServiceId"
                value={form.providerServiceId}
                onChange={handleChange}
                placeholder="101"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">API Key</label>
              <input
                name="providerApiKey"
                value={form.providerApiKey}
                onChange={handleChange}
                placeholder="API Key"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Rate per 1000 ($)</label>
              <input
                type="number"
                step="0.01"
                name="rate"
                value={form.rate}
                onChange={handleChange}
                placeholder="0.25"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Min Order</label>
              <input
                type="number"
                name="min"
                value={form.min}
                onChange={handleChange}
                placeholder="50"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Max Order</label>
              <input
                type="number"
                name="max"
                value={form.max}
                onChange={handleChange}
                placeholder="10000"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Fast delivery, real users..."
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            ></textarea>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="refillAllowed"
                checked={form.refillAllowed}
                onChange={handleChange}
                className="rounded"
              />
              Refill Allowed
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="cancelAllowed"
                checked={form.cancelAllowed}
                onChange={handleChange}
                className="rounded"
              />
              Cancel Allowed
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="rounded"
              />
              Make Default
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            {selectedService ? "Update Service" : "Add Service"}
          </button>
        </form>

        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s._id.slice(-6)}</td>
                  <td className="px-4 py-3">
                    {s.name} {s.isDefault && "(Default)"}
                  </td>
                  <td className="px-4 py-3">{s.category}</td>
                  <td className="px-4 py-3">{s.provider}</td>
                  <td className="px-4 py-3">${s.rate}</td>
                  <td className="px-4 py-3">{s.min}</td>
                  <td className="px-4 py-3">{s.max}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminService;