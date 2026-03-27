//src/pages/reseller/ResellersAdminList.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

import ResellerLayout from "./ResellerAdminLayout";
import ResellerTable from "../../components/reseller/ResellerAdminTable";

const ResellersAdminList = () => {
  const [resellers, setResellers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchResellers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get(`/admin/resellers?page=${page}&limit=20`);

      setResellers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  return (
    <ResellerLayout>
      <div className="space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Resellers</h1>

          <button
            onClick={fetchResellers}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading...
          </div>
        ) : (
          <>
            <ResellerTable resellers={resellers} refresh={fetchResellers} />

            {/* PAGINATION */}
            <div className="flex justify-between items-center text-sm">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>

              <div className="space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 border rounded"
                >
                  Prev
                </button>

                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 border rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ResellerLayout>
  );
};

export default ResellersAdminList;
