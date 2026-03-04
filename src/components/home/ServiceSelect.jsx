const ServiceSelect = ({
  service,
  setService,
  servicesList,
  selectedServiceData,
}) => {
  return (
    <>
      {/* Service Dropdown */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">Service</label>
        <select
          className="p-3 w-[90%] rounded-xl shadow"
          value={service}
          onChange={(e) => setService(e.target.value)}
          disabled={servicesList.length === 0}
        >
          <option value="">Select service</option>
          {servicesList.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">Description</label>
        <textarea
          className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
          rows={3}
          value={selectedServiceData?.description || ""}
          readOnly
        />
      </div>

      {/* Min / Max */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">Min / Max Order</label>
        <input
          type="text"
          className="p-3 w-[90%] rounded-xl shadow bg-gray-100"
          value={
            selectedServiceData
              ? `Min: ${selectedServiceData.min} | Max: ${selectedServiceData.max}`
              : ""
          }
          readOnly
        />
      </div>
    </>
  );
};

export default ServiceSelect;
