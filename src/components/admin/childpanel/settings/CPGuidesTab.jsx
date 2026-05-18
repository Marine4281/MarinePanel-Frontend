// src/components/admin/childpanel/settings/CPGuidesTab.jsx

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import CPGuideRow from "./CPGuideRow";
import API from "../../../../api/axios";
import toast from "react-hot-toast";

export default function CPGuidesTab({ guides, setGuides }) {
  const [newTitle,     setNewTitle]     = useState("");
  const [newContent,   setNewContent]   = useState("");
  const [newPlacement, setNewPlacement] = useState("activation");
  const [adding,       setAdding]       = useState(false);

  const handleUpdate = async (id, updates) => {
    try {
      const res = await API.put(`/admin/child-panel-guides/${id}`, updates);
      setGuides((prev) => prev.map((g) => (g._id === id ? res.data : g)));
      toast.success("Guide updated");
    } catch { toast.error("Failed to update guide"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this guide?")) return;
    try {
      await API.delete(`/admin/child-panel-guides/${id}`);
      setGuides((prev) => prev.filter((g) => g._id !== id));
      toast.success("Guide deleted");
    } catch { toast.error("Failed to delete guide"); }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setAdding(true);
    try {
      const res = await API.post("/admin/child-panel-guides", {
        title: newTitle, content: newContent, placement: newPlacement, visible: true,
      });
      setGuides((prev) => [...prev, res.data]);
      setNewTitle(""); setNewContent(""); setNewPlacement("activation");
      toast.success("Guide created");
    } catch { toast.error("Failed to create guide"); }
    finally   { setAdding(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        These guidelines appear on the child panel activation page, owner dashboard, or both.
      </p>

      {/* New guide form */}
      <div className="border border-dashed rounded-xl p-4 space-y-2 bg-gray-50">
        <p className="text-xs font-semibold text-gray-700 mb-1">New Guideline</p>
        <input
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
          placeholder="Title"
        />
        <textarea
          rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)}
          className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none resize-none"
          placeholder="Content"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={newPlacement} onChange={(e) => setNewPlacement(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs focus:outline-none"
          >
            <option value="activation">Activation page</option>
            <option value="dashboard">Dashboard</option>
            <option value="both">Both</option>
          </select>
          <button
            onClick={handleAdd} disabled={adding}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            <FiPlus size={12} /> {adding ? "Adding..." : "Add Guide"}
          </button>
        </div>
      </div>

      {/* Existing guides */}
      {guides.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No guidelines yet</p>
      ) : (
        <div className="space-y-2">
          {guides.map((g) => (
            <CPGuideRow
              key={g._id} guide={g}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
