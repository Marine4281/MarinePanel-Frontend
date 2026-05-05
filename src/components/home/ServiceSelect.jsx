const ServiceSelect = ({
  service,
  setService,
  servicesList,
  selectedServiceData,
}) => {
  return (
    <>
      {/* Service Dropdown */}
      <div className="mb-5">
        <label className="font-semibold block mb-2 text-gray-700">
          Service
        </label>

        <div className="relative w-[90%]">
          <select
            className="appearance-none p-3 pr-10 w-full rounded-2xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
            value={service}
            onChange={(e) => setService(e.target.value)}
            disabled={servicesList.length === 0}
          >
            <option value="">✨ Select service</option>
            {servicesList.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="font-semibold block mb-2 text-gray-700">
          Description
        </label>
        <textarea
          className="p-3 w-[90%] rounded-2xl border border-gray-200 shadow-sm bg-gray-50 focus:outline-none"
          rows={3}
          value={selectedServiceData?.description || ""}
          readOnly
        />
      </div>

      {/* Min / Max */}
      <div className="mb-5">
        <label className="font-semibold block mb-2 text-gray-700">
          Min / Max Order
        </label>
        <input
          type="text"
          className="p-3 w-[90%] rounded-2xl border border-gray-200 shadow-sm bg-gray-50 focus:outline-none"
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
