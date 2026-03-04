import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import FreeServiceFields from "../components/FreeServiceFields";
import AdminServiceTable from "../components/AdminServiceTable";

const initialForm = {
platform: "",
category: "",
name: "",
provider: "",
providerApiUrl: "",
providerServiceId: "",
providerApiKey: "",
rate: "",
min: "",
max: "",
description: "",
refillAllowed: true,
cancelAllowed: true,
isDefault: false,
isDefaultCategoryGlobal: false,
isDefaultCategoryPlatform: false,

// ✅ FREE SERVICE FIELDS
isFree: false,
freeQuantity: "",
cooldownHours: "",
};

const AdminService = () => {
const [services, setServices] = useState([]);
const [selectedService, setSelectedService] = useState(null);
const [form, setForm] = useState(initialForm);

// ================= FETCH SERVICES =================
const fetchServices = async () => {
try {
const res = await API.get("/admin/services");
setServices(res.data);
} catch (err) {
toast.error("Failed to fetch services");
}
};

useEffect(() => {
fetchServices();
}, []);

// ================= HANDLE INPUT =================
const handleChange = (e) => {
const { name, value, type, checked } = e.target;

setForm((prev) => ({  
  ...prev,  
  [name]: type === "checkbox" ? checked : value,  
}));

};

// ================= SUBMIT =================
const handleSubmit = async (e) => {
e.preventDefault();

if (  
  !form.platform ||  
  !form.category ||  
  !form.name ||  
  !form.provider ||  
  (!form.isFree && !form.rate)  
) {  
  return toast.error("Please fill all required fields");  
}  

try {  
  if (selectedService) {  
    await API.put(`/admin/services/${selectedService._id}`, form);  
    toast.success("Service updated successfully");  
  } else {  
    await API.post("/admin/services", form);  
    toast.success("Service added successfully");  
  }  

  setForm(initialForm);  
  setSelectedService(null);  
  fetchServices();  
} catch (err) {  
  toast.error(err.response?.data?.error || "Failed to save service");  
}

};

// ================= EDIT =================
const handleEdit = (service) => {
setSelectedService(service);
setForm({
...initialForm,
...service,
});

window.scrollTo({ top: 0, behavior: "smooth" });

};

// ================= DELETE =================
const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this service?"))
return;

try {  
  await API.delete(`/admin/services/${id}`);  
  toast.success("Service deleted");  
  fetchServices();  
} catch {  
  toast.error("Failed to delete service");  
}

};

// ================= TOGGLE STATUS =================
const handleToggleStatus = async (id) => {
try {
await API.patch(`/admin/services/${id}/toggle`);
toast.success("Service status updated");
fetchServices();
} catch {
toast.error("Failed to update status");
}
};

return (
<div className="flex min-h-screen bg-gray-100">

<div className="w-34 h-full">  
  <Sidebar />  
</div>  

<div className="flex-1 ml-34 p-6">  

  <h2 className="text-3xl font-bold mb-8">  
    {selectedService ? "Edit Service" : "Add New Service"}  
  </h2>  

  <form  
    onSubmit={handleSubmit}  
    className="bg-white rounded-2xl shadow-lg p-8 mb-10 space-y-6"  
  >  

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  

      <div>  
        <label className="block font-medium mb-1">Platform *</label>  
        <input  
          name="platform"  
          value={form.platform}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
          required  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Category *</label>  
        <input  
          name="category"  
          value={form.category}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
          required  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Service Name *</label>  
        <input  
          name="name"  
          value={form.name}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
          required  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Provider *</label>  
        <input  
          name="provider"  
          value={form.provider}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
          required  
        />  
      </div>  

      {/* ✅ ADDED: Provider API URL */}  
      <div>  
        <label className="block font-medium mb-1">Provider API URL</label>  
        <input  
          name="providerApiUrl"  
          value={form.providerApiUrl}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

      {/* ✅ ADDED: Provider API Key */}  
      <div>  
        <label className="block font-medium mb-1">Provider API Key</label>  
        <input  
          name="providerApiKey"  
          value={form.providerApiKey}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Rate per 1000 ($)</label>  
        <input  
          type="number"  
          step="0.01"  
          name="rate"  
          value={form.rate}  
          onChange={handleChange}  
          disabled={form.isFree}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Min Order</label>  
        <input  
          type="number"  
          name="min"  
          value={form.min}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Max Order</label>  
        <input  
          type="number"  
          name="max"  
          value={form.max}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

      <div>  
        <label className="block font-medium mb-1">Provider Service ID</label>  
        <input  
          name="providerServiceId"  
          value={form.providerServiceId}  
          onChange={handleChange}  
          className="w-full p-3 border rounded-lg"  
        />  
      </div>  

    </div>  

    <div>  
      <label className="block font-medium mb-1">Description</label>  
      <textarea  
        name="description"  
        value={form.description}  
        onChange={handleChange}  
        rows={3}  
        className="w-full p-3 border rounded-lg"  
      />  
    </div>  

    <label className="flex items-center gap-2">  
      <input  
        type="checkbox"  
        name="isFree"  
        checked={form.isFree}  
        onChange={handleChange}  
      />  
      🎁 Enable Free Service  
    </label>  

    <FreeServiceFields form={form} handleChange={handleChange} />  

    <div className="flex flex-wrap gap-6 pt-4">  
      <label className="flex items-center gap-2">  
        <input  
          type="checkbox"  
          name="refillAllowed"  
          checked={form.refillAllowed}  
          onChange={handleChange}  
        />  
        Refill Allowed  
      </label>  

      <label className="flex items-center gap-2">  
        <input  
          type="checkbox"  
          name="cancelAllowed"  
          checked={form.cancelAllowed}  
          onChange={handleChange}  
        />  
        Cancel Allowed  
      </label>  

      <label className="flex items-center gap-2">  
        <input  
          type="checkbox"  
          name="isDefault"  
          checked={form.isDefault}  
          onChange={handleChange}  
        />  
        Default Service (per category)  
      </label>  

      <label className="flex items-center gap-2">  
        <input  
          type="checkbox"  
          name="isDefaultCategoryGlobal"  
          checked={form.isDefaultCategoryGlobal}  
          onChange={handleChange}  
        />  
        Default Category (Global)  
      </label>  

      <label className="flex items-center gap-2">  
        <input  
          type="checkbox"  
          name="isDefaultCategoryPlatform"  
          checked={form.isDefaultCategoryPlatform}  
          onChange={handleChange}  
        />  
        Default Category (Per Platform)  
      </label>  
    </div>  

    <button  
      type="submit"  
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"  
    >  
      {selectedService ? "Update Service" : "Add Service"}  
    </button>  
  </form>  

  <AdminServiceTable  
    services={services}  
    onEdit={handleEdit}  
    onDelete={handleDelete}  
    onToggleStatus={handleToggleStatus}  
  />  

</div>  
</div>
);
};

export default AdminService;
