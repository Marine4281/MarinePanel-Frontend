//src/pages/reseller/ResellerAdminDetails.jsx
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

  const fetchDetails = async () => {
    const res = await API.get(`/admin/resellers/${id}`);
    setData(res.data.data);
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (!data) return <ResellerLayout>Loading...</ResellerLayout>;

  return (
    <ResellerLayout>
      <div className="space-y-6">
        <ResellerStats reseller={data.reseller} stats={data.stats} refresh={fetchDetails} />
        <ResellerUsers resellerId={id} />
        <ResellerOrders resellerId={id} />
      </div>
    </ResellerLayout>
  );
};

export default ResellerAdminDetails;
