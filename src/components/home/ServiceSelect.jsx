// src/components/home/ServiceSelect.jsx
import { useState, useRef, useEffect } from "react";

const ServiceSelect = ({ service, setService, servicesList, selectedServiceData }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef();

  const selected = servicesList.find((s) => s.name === service);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredServices = servicesList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.serviceId || "").includes(search)
  );

  return (
    <>
      <div className="mb-5 w-[90%]" ref={dropdownRef}>
        <label className="font-semibold block mb-2 text-gray-700">Service</label>

        <div
          onClick={() => setOpen(!open)}
          className="p-3 rounded-2xl border bg-white shadow-sm cursor-pointer flex justify-between items-center"
        >
          <span className={selected ? "text-gray-800 flex items-center gap-2" : "text-gray-400"}>
            {selected ? (
              <>
                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  #{selected.serviceId}
                </span>
                {selected.name}
              </>
            ) : (
              "✨ Select service"
            )}
          </span>
          <span className={`transition ${open ? "rotate-180" : ""}`}>▼</span>
        </div>

        {open && (
          <div className="mt-2 bg-white border rounded-2xl shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-52 overflow-y-auto">
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => {
                      setService(s.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`p-3 cursor-pointer transition flex items-center gap-2 ${
                      service === s.name
                        ? "bg-green-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        service === s.name
                          ? "bg-white/20 text-white"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      #{s.serviceId}
                    </span>
                    <span className="text-sm">{s.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-400 text-center">No services found</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="font-semibold block mb-2 text-gray-700">Description</label>
        <textarea
          className="p-3 w-[90%] rounded-2xl border bg-gray-50"
          rows={3}
          value={selectedServiceData?.description || ""}
          readOnly
        />
      </div>

      <div className="mb-5">
        <label className="font-semibold block mb-2 text-gray-700">Min / Max Order</label>
        <input
          type="text"
          className="p-3 w-[90%] rounded-2xl border bg-gray-50"
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
