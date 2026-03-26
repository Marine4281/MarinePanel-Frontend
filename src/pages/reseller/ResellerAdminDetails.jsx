//src/pages/reseller/ResellerAdminDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";

import ResellerAdminLayout from "./ResellerAdminLayout"; // ✅ ADD THIS

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
    } catch {
      console.error("Failed to fetch reseller details");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (!data) {
    return (
      <ResellerLayout>
        <p>Loading...</p>
      </ResellerLayout>
    );
  }

  return (
    <ResellerLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold">Reseller Details</h1>

        <ResellerStats reseller={data.reseller} stats={data.stats} />

        <ResellerUsers users={data.users} />

        <ResellerOrders resellerId={id} />
      </div>
    </ResellerLayout>
  );
};

export default ResellerAdminDetails;
