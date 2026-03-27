//src/pages/reseller/ResellersAdminList.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

import ResellerAdminLayout from "./ResellerAdminLayout"; // ✅ ADD THIS
import ResellerAdminTable from "../../components/reseller/ResellerAdminTable";

const ResellersAdminList = () => {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResellers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/resellers");
      setResellers(res.data || []);

    } catch (error) {
      console.error("Failed to fetch resellers");
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  return (
    <ResellerAdminLayout>
      <div className="space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Resellers</h1>

          <button
            onClick={fetchResellers}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading resellers...
          </div>
        ) : (
          <ResellerAdminTable
            resellers={resellers}
            refresh={fetchResellers}
          />
        )}

      </div>
    </ResellerAdminLayout>
  );
};

export default ResellersAdminList;
