//src/pages/reseller/ResellerAdminLayout.jsx
import Sidebar from "../../components/Sidebar";

const ResellerLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default ResellerAdminLayout;
