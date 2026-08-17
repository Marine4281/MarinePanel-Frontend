// src/pages/AdminApi.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api/axios";
import {
  FiActivity, FiUsers, FiList, FiAward, FiBookOpen,
} from "react-icons/fi";

import ApiOverviewTab from "../components/api/ApiOverviewTab";
import ApiUsersTab from "../components/api/ApiUsersTab";
import ApiLogsTab from "../components/api/ApiLogsTab";
import ApiLeaderboardTab from "../components/api/ApiLeaderboardTab";
import ApiDocsTab from "../components/api/ApiDocsTab";

const TABS = [
  { key: "overview",    label: "Overview",    icon: FiActivity },
  { key: "users",       label: "API Users",   icon: FiUsers },
  { key: "logs",        label: "Request Log", icon: FiList },
  { key: "leaderboard", label: "Leaderboard", icon: FiAward },
  { key: "docs",        label: "Docs",        icon: FiBookOpen },
];

const AdminApi = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await API.get("/admin/api/overview");
      setOverview(data);
    } catch (err) {
      console.error("Failed to fetch API overview", err);
      toast.error("Failed to load API overview");
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <Topbar />

        <div className="flex items-center justify-between mt-6 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">API Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Control access, monitor usage, and manage keys for your public API.
            </p>
          </div>

          {overview && (
            <span
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                overview.apiEnabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  overview.apiEnabled ? "bg-green-500" : "bg-red-500"
                } ${overview.apiEnabled ? "animate-pulse" : ""}`}
              />
              API {overview.apiEnabled ? "Live" : "Disabled"}
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow"
                    : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon className="text-base" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <ApiOverviewTab
            overview={overview}
            loading={loadingOverview}
            onOverviewChange={setOverview}
          />
        )}
        {activeTab === "users" && <ApiUsersTab />}
        {activeTab === "logs" && <ApiLogsTab />}
        {activeTab === "leaderboard" && <ApiLeaderboardTab />}
        {activeTab === "docs" && <ApiDocsTab />}
      </div>
    </div>
  );
};

export default AdminApi;
