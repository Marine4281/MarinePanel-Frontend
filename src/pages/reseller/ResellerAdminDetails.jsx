//src/pages/reseller/ResellerAdminDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";

import ResellerAdminLayout from "./ResellerAdminLayout";
import ResellerAdminStats from "../../components/reseller/ResellerAdminStats";
import ResellerAdminUsers from "../../components/reseller/ResellerAdminUsers";
import ResellerAdminOrders from "../../components/reseller/ResellerAdminOrders";

const ResellerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/admin/resellers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (!data) {
    return (
      <ResellerAdminLayout>
        <p className="p-4 text-gray-500">Loading...</p>
      </ResellerAdminLayout>
    );
  }

  return (
    <ResellerAdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Reseller Details</h1>

        <ResellerAdminStats reseller={data.reseller} stats={data.stats} />
        <ResellerAdminUsers users={data.users} />
        <ResellerAdminOrders resellerId={id} />
      </div>
    </ResellerAdminLayout>
  );
};

export default ResellerDetails;
