// src/pages/AdminService.jsx
import { useState, useMemo } from "react";
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

const SERVICES_PER_PAGE = 20;

const AdminService = () => {
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [currentPage, setCurrentPage] = useState(1);

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

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE) || 1;

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * SERVICES_PER_PAGE;
    return services.slice(start, start + SERVICES_PER_PAGE);
  }, [services, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(1, currentPage - 2);
      const right = Math.min(totalPages, currentPage + 2);

      if (left > 1) pages.push(1, "...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages) pages.push("...", totalPages);
    }

    return pages;
  };

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
        if (!form.newProviderName || !form.providerApiUrl || !form.providerApiKey) {
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

      const payload = { ...form, providerProfileId: providerId };

      if (selectedService) {
        await API.put(`/admin/services/${selectedService._id}`, payload);
        toast.success("Service updated");
      } else {
        await API.post("/admin/services", payload);
        toast.success("Service added");
      }

      setForm(initialForm);
      setSelectedService(null);
      setCurrentPage(1);

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

        {/* FORM */}
        <AdminServiceForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          providers={providers}
          isAddingNewProvider={isAddingNewProvider}
          selectedService={selectedService}
        />

        {/* GLOBAL TOGGLES */}
        <ServiceToggleActions />

        {/* TABLE */}
        <AdminServiceTable
          services={paginatedServices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    currentPage === page
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <span className="text-xs text-gray-400 ml-2">
              {services.length} total · Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminService;
