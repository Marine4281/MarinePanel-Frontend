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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  return (
    <ResellerLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Reseller Details
            </h1>
            <p className="text-sm text-gray-500">
              Manage reseller performance, users, and orders
            </p>
          </div>

          {/* Reseller Info Card */}
          {!loading && data?.reseller && (
            <div className="bg-white shadow-sm border rounded-xl px-4 py-3 flex items-center gap-4 min-w-[260px]">

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {data.reseller.name?.charAt(0)?.toUpperCase() || "R"}
              </div>

              {/* Info */}
              <div className="flex flex-col leading-tight">
                <p className="text-sm font-medium text-gray-800">
                  {data.reseller.name || "Unnamed"}
                </p>
                <p className="text-xs text-gray-500">
                  {data.reseller.email}
                </p>

                {/* 🌍 Country + Flag */}
                <div className="flex items-center gap-2 mt-1">
                  {data.reseller.countryCode ? (
                    <img
                      src={`https://flagcdn.com/w20/${data.reseller.countryCode.toLowerCase()}.png`}
                      alt={data.reseller.country}
                      className="w-5 h-4 rounded-sm object-cover border"
                    />
                  ) : (
                    <div className="w-5 h-4 bg-gray-200 rounded-sm" />
                  )}

                  <span className="text-xs text-gray-600">
                    {data.reseller.country || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        )}

        {/* CONTENT */}
        {!loading && data && (
          <>
            {/* STATS */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
              <ResellerStats
                reseller={data.reseller}
                stats={data.stats}
                refresh={fetchDetails}
              />
            </div>

            {/* USERS */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Users
                </h2>
                <p className="text-xs text-gray-500">
                  All users under this reseller
                </p>
              </div>
              <ResellerUsers resellerId={id} />
            </div>

            {/* ORDERS */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Orders
                </h2>
                <p className="text-xs text-gray-500">
                  Transactions & activity
                </p>
              </div>
              <ResellerOrders resellerId={id} />
            </div>
          </>
        )}
      </div>
    </ResellerLayout>
  );
};

export default ResellerAdminDetails;
