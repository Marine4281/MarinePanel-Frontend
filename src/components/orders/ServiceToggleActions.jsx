import API from "../../api/axios";

const ServiceToggleActions = ({ service, onRefresh }) => {

  const toggleRefill = async () => {
    await API.patch(`/admin/services/${service._id}/toggle-refill`);
    onRefresh();
  };

  const toggleCancel = async () => {
    await API.patch(`/admin/services/${service._id}/toggle-cancel`);
    onRefresh();
  };

  return (
    <div className="flex gap-2">

      <button
        onClick={toggleRefill}
        className={`px-2 py-1 text-xs rounded ${
          service.refillAllowed ? "bg-green-500" : "bg-gray-400"
        }`}
      >
        {service.refillAllowed ? "Disable Refill" : "Enable Refill"}
      </button>

      <button
        onClick={toggleCancel}
        className={`px-2 py-1 text-xs rounded ${
          service.cancelAllowed ? "bg-red-500" : "bg-gray-400"
        }`}
      >
        {service.cancelAllowed ? "Disable Cancel" : "Enable Cancel"}
      </button>

    </div>
  );
};

export default ServiceToggleActions;
