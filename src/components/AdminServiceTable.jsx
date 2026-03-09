import { useState, useMemo } from "react";
import { FiCopy, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminServiceTable = ({
services,
onEdit,
onDelete,
onToggleStatus,
}) => {
const [search, setSearch] = useState("");
const [selectedDescription, setSelectedDescription] = useState(null);

// ================= SEARCH FILTER =================
const filteredServices = useMemo(() => {
if (!search) return services;

return services.filter((s) =>
s.providerServiceId?.toLowerCase().includes(search.toLowerCase()) ||
String(s.serviceId)?.includes(search) ||
s._id?.toLowerCase().includes(search.toLowerCase()) ||
s.category?.toLowerCase().includes(search.toLowerCase()) ||
s.name?.toLowerCase().includes(search.toLowerCase()) ||
String(s.rate)?.includes(search)
);

}, [search, services]);

const copyToClipboard = (text) => {
navigator.clipboard.writeText(text);
toast.success("Copied!");
};

return (
<div className="bg-white rounded-2xl shadow-lg p-6">

{/* ================= SEARCH ================= */}
<div className="mb-6">
<input
type="text"
placeholder="Search by Service ID, Provider ID, Category, Name or Rate..."
value={search}
onChange={(e) => setSearch(e.target.value)}
className="w-full md:w-1/2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
/>
</div>

{/* ================= TABLE ================= */}
<div className="overflow-x-auto">
<table className="w-full text-sm text-left">
<thead className="bg-gray-100 uppercase text-gray-600 text-xs">
<tr>
<th className="px-4 py-3">System ID</th>
<th className="px-4 py-3">Platform</th>
<th className="px-4 py-3">Category</th>
<th className="px-4 py-3">Service</th>
<th className="px-4 py-3">Provider</th>
<th className="px-4 py-3">Provider ID</th>
<th className="px-4 py-3">Rate</th>
<th className="px-4 py-3">Description</th>
<th className="px-4 py-3">Status</th>
<th className="px-4 py-3">Actions</th>
</tr>
</thead>

<tbody className="divide-y">
{filteredServices.map((s) => (

<tr key={s._id} className="hover:bg-gray-50">

{/* System ID */}
<td className="px-4 py-3 text-xs flex items-center gap-2 whitespace-nowrap">
<span>{s.serviceId || s._id.slice(-6)}</span>
<button
onClick={() =>
copyToClipboard(s.serviceId || s._id.slice(-6))
}
className="text-gray-500 hover:text-black"
>
<FiCopy size={14} />
</button>
</td>

<td className="px-4 py-3 whitespace-nowrap">{s.platform}</td>

<td className="px-4 py-3 whitespace-nowrap">
{s.category}
{s.isDefaultCategoryGlobal && " (Global Default)"}
{s.isDefaultCategoryPlatform && " (Platform Default)"}
</td>

{/* FIXED SERVICE NAME COLUMN */}
<td className="px-4 py-3 max-w-[350px] break-words">
{s.name
?.replace(/\n/g, " ")
.replace(/\s+/g, " ")
.trim()}{" "}
{s.isDefault && "(Service Default)"}
</td>

<td className="px-4 py-3 whitespace-nowrap">{s.provider}</td>

<td className="px-4 py-3 flex items-center gap-2 whitespace-nowrap">
{s.providerServiceId}
<button
onClick={() => copyToClipboard(s.providerServiceId)}
className="text-gray-500 hover:text-black"
>
<FiCopy size={14} />
</button>
</td>

<td className="px-4 py-3 whitespace-nowrap">
{s.isFree ? "FREE" : `$${s.rate}`}
</td>

<td className="px-4 py-3">
<button
onClick={() => setSelectedDescription(s.description)}
className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-black"
>
View
</button>
</td>

<td className="px-4 py-3">
<span
className={`px-2 py-1 text-xs rounded-full text-white ${
s.status ? "bg-green-500" : "bg-gray-500"
}`}
>
{s.status ? "Visible" : "Hidden"}
</span>
</td>

<td className="px-4 py-3 flex gap-2 whitespace-nowrap">
<button
onClick={() => onEdit(s)}
className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
>
Edit
</button>

<button
onClick={() => onToggleStatus(s._id)}
className={`px-3 py-1 rounded text-xs text-white ${
s.status ? "bg-yellow-500" : "bg-green-600"
}`}
>
{s.status ? "Hide" : "Show"}
</button>

<button
onClick={() => onDelete(s._id)}
className="bg-red-500 text-white px-3 py-1 rounded text-xs"
>
Delete
</button>
</td>

</tr>

))}
</tbody>
</table>
</div>

{/* ================= DESCRIPTION MODAL ================= */}
{selectedDescription !== null && (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
<div className="bg-white p-8 rounded-2xl w-[550px] max-w-[95%] shadow-2xl relative">

<button
onClick={() => setSelectedDescription(null)}
className="absolute top-4 right-4 text-gray-500 hover:text-black"
>
<FiX size={20} />
</button>

<h3 className="text-xl font-semibold mb-6 text-center">
Service Description
</h3>

<div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-line max-h-[300px] overflow-y-auto">
{selectedDescription || "No description provided"}
</div>

<div className="flex justify-center mt-6">
<button
onClick={() => copyToClipboard(selectedDescription)}
className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
>
<FiCopy />
Copy
</button>
</div>

</div>
</div>
)}

</div>
);
};

export default AdminServiceTable;
