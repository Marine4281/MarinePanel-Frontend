//
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ResellerTable from "../../components/reseller/ResellerTable";

const ResellersList = () => {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResellers = async () => {
    try {
      const res = await API.get("/admin/resellers");
      setResellers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch resellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Resellers</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResellerTable resellers={resellers} refresh={fetchResellers} />
      )}
    </div>
  );
};

export default ResellersList;
