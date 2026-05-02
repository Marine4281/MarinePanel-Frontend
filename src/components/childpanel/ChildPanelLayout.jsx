// src/components/childpanel/ChildPanelLayout.jsx
// Wraps every child panel page with the sidebar + topbar.
// Mirrors ResellerAdminLayout.jsx.

import { useState } from "react";
import ChildPanelSidebar from "./ChildPanelSidebar";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function ChildPanelLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ChildPanelSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — mobile only */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-600 hover:text-blue-600"
          >
            <FiMenu size={22} />
          </button>

          <span className="font-semibold text-blue-600 text-sm truncate max-w-[180px]">
            {user?.childPanelBrandName || "Child Panel"}
          </span>

          {/* Wallet balance pill */}
          <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-1 rounded-full">
            ${Number(user?.balance || 0).toFixed(2)}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
