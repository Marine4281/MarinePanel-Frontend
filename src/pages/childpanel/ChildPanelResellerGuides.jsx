// src/pages/childpanel/ChildPanelResellerGuides.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelSidebar from "../../components/childpanel/ChildPanelSidebar";
import CPHeader from "../../components/childpanel/CPHeader";

const VALID_PLACEMENTS = [
  { value: "activation", label: "Activation Page" },
  { value: "dashboard",  label: "Dashboard Guides" },
  { value: "both",       label: "Both" },
];

const placementColor = (placement) => {
  switch (placement) {
    case "activation": return "bg-blue-100 text-blue-700";
    case "dashboard":  return "bg-purple-100 text-purple-700";
    case "both":       return "bg-orange-100 text-orange-700";
    default:           return "bg-gray-100 text-gray-700";
  }
};

export default function ChildPanelResellerGuides() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [guides,     setGuides]     = useState([]);
  const [title,      setTitle]      = useState("");
  const [content,    setContent]    = useState("");
  const [order,      setOrder]      = useState(0);
  const [visible,    setVisible]    = useState(true);
  const [placement,  setPlacement]  = useState("activation");
  const [editingId,  setEditingId]  = useState(null);

  /* ── Fetch ── */
  const fetchGuides = async () => {
    try {
      const res = await API.get("/cp/reseller-guides");
      setGuides(res.data);
    } catch {
      toast.error("Failed to load guides");
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  /* ── Reset form ── */
  const resetForm = () => {
    setTitle("");
    setContent("");
    setOrder(0);
    setVisible(true);
    setPlacement("activation");
    setEditingId(null);
  };

  /* ── Save (create or update) ── */
  const saveGuide = async () => {
    if (!title.trim() || !content.trim()) {
      return toast.error("Title and content are required");
    }

    try {
      const payload = { title, content, order: Number(order), visible, placement };

      if (editingId) {
        await API.put(`/cp/reseller-guides/${editingId}`, payload);
        toast.success("Guide updated");
      } else {
        await API.post("/cp/reseller-guides", payload);
        toast.success("Guide created");
      }

      resetForm();
      fetchGuides();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save guide");
    }
  };

  /* ── Edit ── */
  const editGuide = (guide) => {
    setTitle(guide.title);
    setContent(guide.content);
    setOrder(guide.order || 0);
    setVisible(guide.visible !== undefined ? guide.visible : true);
    setPlacement(guide.placement || "activation");
    setEditingId(guide._id);
  };

  /* ── Delete ── */
  const deleteGuide = async (id) => {
    if (!window.confirm("Delete this guide?")) return;
    try {
      await API.delete(`/cp/reseller-guides/${id}`);
      toast.success("Guide deleted");
      fetchGuides();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete guide");
    }
  };

  /* ── Toggle visibility ── */
  const toggleVisibility = async (guide) => {
    try {
      await API.put(`/cp/reseller-guides/${guide._id}`, { visible: !guide.visible });
      toast.success("Guide updated");
      fetchGuides();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update visibility");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ChildPanelSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <CPHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Reseller Guides</h1>
            <p className="text-sm text-gray-500">
              Manage onboarding guides shown to your resellers
            </p>
          </div>

          {/* Create / Edit form */}
          <div className="bg-white shadow-sm rounded-xl p-6 mb-8 border">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Guide" : "Create Guide"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Guide Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="number"
                placeholder="Order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <textarea
              placeholder="Guide Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full mt-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows="5"
            />

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Placement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Guide On
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {VALID_PLACEMENTS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  id="visible"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="visible" className="text-sm text-gray-700">
                  Visible to resellers
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveGuide}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
              >
                {editingId ? "Update Guide" : "Create Guide"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Guides table */}
          <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-sm text-gray-600">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Placement</th>
                  <th className="p-4 text-left">Visible</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-400">
                      No guides created yet
                    </td>
                  </tr>
                )}

                {guides.map((guide) => (
                  <tr key={guide._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{guide.title}</td>
                    <td className="p-4 text-gray-600">{guide.order}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${placementColor(guide.placement)}`}>
                        {guide.placement}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleVisibility(guide)}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${
                          guide.visible
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {guide.visible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => editGuide(guide)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGuide(guide._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
                       }
