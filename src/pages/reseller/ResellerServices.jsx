//src/pages/reseller/ResellerServices.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ResellerServiceTable from "../../components/reseller/ResellerServiceTable";

export default function ResellerServices() {
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0);
  const [newCommission, setNewCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /*
  -----------------------------
  Fetch Services
  -----------------------------
  */
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reseller/services");
      const servicesData = res.data.services || [];
      const commissionData = Number(res.data.commission || 0);

      setServices(servicesData);
      setCommission(commissionData);
      setNewCommission(commissionData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /*
  -----------------------------
  Debounce search
  -----------------------------
  */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /*
  -----------------------------
  Toggle Visibility (per reseller)
  -----------------------------
  */
  const toggleVisibility = async (serviceId, visible) => {
    try {
      await API.patch("/reseller/services/visibility", { serviceId, visible });
      setServices((prev) =>
        prev.map((s) =>
          s._id === serviceId ? { ...s, visible } : s
        )
      );
      toast.success("Visibility updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update visibility");
    }
  };

  /*
  -----------------------------
  Update Service (name/category)
  -----------------------------
  */
  const updateService = async (serviceId, newName, newCategoryName) => {
    try {
      await API.patch("/reseller/services/update", {
        serviceId,
        newName,
        newCategoryName
      });
      toast.success("Updated successfully");
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  /*
  -----------------------------
  Update Commission
  -----------------------------
  */
  const updateCommission = async () => {
    try {
      const value = Number(newCommission);
      const res = await API.patch("/reseller/services/commission", { commission: value });
      const updatedCommission = Number(res.data.commission ?? value);

      setCommission(updatedCommission);
      setNewCommission(updatedCommission);

      toast.success("Commission updated");
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update commission");
    }
  };

  /*
  -----------------------------
  Filter Services
  -----------------------------
  */
  const filteredServices = useMemo(() => {
  if (!debouncedSearch.trim()) return services;

  const lower = debouncedSearch.toLowerCase();

  return services.filter((s) => {
    const name = s.name?.toLowerCase() || "";
    const category = s.category?.toLowerCase() || "";
    const id = s.serviceId?.toString() || s._id?.toString() || "";

    const systemRate = Number(s.systemRate || 0);
    const resellerRate = Number(s.resellerRate || 0);

    return (
      name.includes(lower) ||
      category.includes(lower) ||
      id.includes(lower) ||
      systemRate.toFixed(6).includes(lower) ||
      resellerRate.toFixed(6).includes(lower)
    );
  });
}, [services, debouncedSearch]);
  if (loading) {
    return <div className="p-6 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-orange-500 mb-6">
        Reseller Services
      </h1>

      {/* COMMISSION PANEL */}
      <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-orange-500">
        <label className="block font-semibold mb-2 text-orange-500">
          Global Commission (%)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={newCommission}
            onChange={(e) => setNewCommission(e.target.value)}
            className="border p-2 rounded w-32"
          />
          <button
            onClick={updateCommission}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4 max-w-md">
        <input
          type="text"
          placeholder="Search by name, category, ID, system price, reseller price"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl shadow border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* TABLE */}
      <ResellerServiceTable
        services={filteredServices}
        commission={commission}
        toggleVisibility={toggleVisibility}
        updateService={updateService}
      />
    </div>
  );
}
