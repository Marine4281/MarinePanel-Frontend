import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import AdminServiceTable from "../components/AdminServiceTable";
import AdminServiceForm from "../components/AdminServiceForm";

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

  const isAddingNewProvider = form.providerProfileId === "new";

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleEdit = (service) => {
    setSelectedService(service);

    setForm({
      ...initialForm,
      ...service,
      providerProfileId: service.providerProfileId?._id || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-8">
          {selectedService ? "Edit Service" : "Add New Service"}
        </h2>

        <AdminServiceForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          providers={providers}
          isAddingNewProvider={isAddingNewProvider}
          selectedService={selectedService}
        />

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
