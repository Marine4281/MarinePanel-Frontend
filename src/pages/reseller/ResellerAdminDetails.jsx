// src/pages/reseller/ResellerAdminDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";

import ResellerLayout from "./ResellerAdminLayout";
import ResellerStats from "../../components/reseller/ResellerAdminStats";
import ResellerUsers from "../../components/reseller/ResellerAdminUsers";
import ResellerOrders from "../../components/reseller/ResellerAdminOrders";

const ResellerAdminDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/resellers/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reseller details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <ResellerLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-gray-500 text-lg">
            Loading reseller details...
          </div>
        </div>
      </ResellerLayout>
    );
  }

  if (!data) {
    return (
      <ResellerLayout>
        <div className="text-center text-red-500 mt-10">
          Failed to load reseller data
        </div>
      </ResellerLayout>
    );
  }

  const { reseller } = data;

  return (
    <ResellerLayout>
      <div className="space-y-6">
        
        {/* 🔹 Header / Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {reseller?.brandName || "Reseller Panel"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {reseller?.email}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                ID: {reseller?._id}
              </span>

              {reseller?.isActive ? (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                  Suspended
                </span>
              )}
            </div>
          </div>

          {/* Right Actions (future ready) */}
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm">
              Refresh
            </button>
            <button className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90">
              Manage
            </button>
          </div>
        </div>

        {/* 🔹 Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Overview
          </h2>
          <ResellerStats
            reseller={data.reseller}
            stats={data.stats}
            refresh={fetchDetails}
          />
        </div>

        {/* 🔹 Users Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Users
            </h2>
          </div>
          <ResellerUsers resellerId={id} />
        </div>

        {/* 🔹 Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Orders
            </h2>
          </div>
          <ResellerOrders resellerId={id} />
        </div>

      </div>
    </ResellerLayout>
  );
};

export default ResellerAdminDetails;
