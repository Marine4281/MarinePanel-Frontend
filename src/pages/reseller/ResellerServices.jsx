// src/pages/reseller/ResellerServices.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { FiMenu, FiLogOut } from "react-icons/fi";

import Sidebar from "../../components/reseller/Sidebar";
import ResellerServiceTable from "../../components/reseller/ResellerServiceTable";

const SERVICES_PER_PAGE = 20;

export default function ResellerServices() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [services, setServices] = useState([]);
  const [commission, setCommission] = useState(0);
  const [newCommission, setNewCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const dashRes = await API.get("/reseller/dashboard");
      setBrandName(dashRes.data?.brandName || "Reseller Panel");

      const res = await API.get("/reseller/services");

      const servicesData = res.data.services || [];
      const commissionData = Number(res.data.commission || 0);

      const servicesWithFinalRate = servicesData.map((s) => ({
        ...s,
        finalRate: Number(s.resellerRate ?? s.systemRate ?? 0),
      }));

      setServices(servicesWithFinalRate);
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const toggleVisibility = async (serviceId, visible) => {
    try {
      await API.patch("/reseller/services/visibility", { serviceId, visible });
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, visible } : s))
      );
      toast.success("Visibility updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update visibility");
    }
  };

  const updateService = async (serviceId, newName, newCategoryName) => {
    try {
      await API.patch("/reseller/services/update", {
        serviceId,
        newName,
        newCategoryName,
      });
      toast.success("Updated successfully");
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  const updateCommission = async () => {
    try {
      const value = Number(newCommission);
      const res = await API.patch("/reseller/services/commission", {
        commission: value,
      });

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

  /* ===============================
     FILTER
  =============================== */
  const filteredServices = useMemo(() => {
    if (!debouncedSearch.trim()) return services;

    const lower = debouncedSearch.toLowerCase();

    return services.filter((s) => {
      const name = s.name?.toLowerCase() || "";
      const category = s.category?.toLowerCase() || "";
      const id = s.serviceId?.toString() || s._id?.toString() || "";
      const systemRate = Number(s.systemRate || 0);
      const resellerRate = Number(s.resellerRate ?? systemRate);

      return (
        name.includes(lower) ||
        category.includes(lower) ||
        id.includes(lower) ||
        systemRate.toFixed(6).includes(lower) ||
        resellerRate.toFixed(6).includes(lower)
      );
    });
  }, [services, debouncedSearch]);

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages =
    Math.ceil(filteredServices.length / SERVICES_PER_PAGE) || 1;

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * SERVICES_PER_PAGE;
    return filteredServices.slice(start, start + SERVICES_PER_PAGE);
  }, [filteredServices, currentPage]);

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

  return (
    <div className="flex min-h-screen w-full max-w-full bg-gray-100 overflow-x-hidden">

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 flex-shrink-0">
        <Sidebar brandName={brandName} />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <Sidebar
          brandName={brandName}
          mobile
          close={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white p-4 shadow-md w-full">
          <button onClick={() => setMenuOpen(true)}>
            <FiMenu size={20} />
          </button>
          <h1 className="text-lg font-bold text-orange-500">Services</h1>
          <FiLogOut size={20} />
        </header>

        <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden pb-24">

          {loading ? (
            <div className="text-gray-500">Loading services...</div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-orange-500 mb-6">
                Reseller Services
              </h1>

              {/* Commission */}
              <div className="bg-white p-4 rounded shadow mb-6 border-l-4 border-orange-500 w-full max-w-full">
                <label className="block font-semibold mb-2 text-orange-500">
                  Global Commission (%)
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className="border p-2 rounded w-32 max-w-full"
                  />
                  <button
                    onClick={updateCommission}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4 w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search by name, category, ID, system price, reseller price"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 rounded-xl shadow border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Count */}
              <p className="text-sm text-gray-500 mb-3">
                Showing {paginatedServices.length} of {filteredServices.length} services
              </p>

              {/* TABLE */}
              <div className="w-full max-w-full overflow-x-auto">
                <ResellerServiceTable
                  services={paginatedServices}
                  commission={commission}
                  toggleVisibility={toggleVisibility}
                  updateService={updateService}
                  pageOffset={(currentPage - 1) * SERVICES_PER_PAGE} // ← ADDED
                />
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-white border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-1.5 text-sm text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                          currentPage === p
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {p}
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
                    {filteredServices.length} total · Page {currentPage} of{" "}
                    {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
                    }
