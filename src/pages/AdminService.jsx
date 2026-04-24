// src/pages/AdminService.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import AdminServiceTable from "../components/AdminServiceTable";
import AdminServiceForm from "../components/AdminServiceForm";
import { QUERY_KEYS } from "../constants/queryKeys";
import ServiceToggleActions from "../components/AdminServiceTable/ServiceToggleActions";

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
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(initialForm);

  const isAddingNewProvider = form.providerProfileId === "new";

  /* ================= FETCH SERVICES ================= */
  const { data: services = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: async () => {
      const res = await API.get("/admin/services");
      return res.data;
    },
  });

  /* ================= FETCH PROVIDERS ================= */
  const { data: providers = [] } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await API.get("/provider/profiles");
      return res.data;
    },
  });

  /* ================= FORM HANDLER ================= */
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

      // 🔥 React Query refresh
      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);
      queryClient.invalidateQueries(["providers"]);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
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
    if (!window.confirm("Delete this service?")) return;

    try {
      await API.delete(`/admin/services/${id}`);
      toast.success("Deleted");

      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/admin/services/${id}/toggle`);
      toast.success("Updated");

      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);
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

        {/* ================= FORM ================= */}
        <AdminServiceForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          providers={providers}
          isAddingNewProvider={isAddingNewProvider}
          selectedService={selectedService}
        />

        {/* 🔥 GLOBAL TOGGLES */}
        <ServiceToggleActions />

        {/* ================= TABLE ================= */}
        <AdminServiceTable
          services={services}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

      </div>
    </div>
  );
};

export default AdminService;
