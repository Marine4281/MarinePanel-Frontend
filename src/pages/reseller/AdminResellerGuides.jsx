import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const AdminResellerGuides = () => {
  const [guides, setGuides] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchGuides = async () => {
    try {
      const res = await API.get("/reseller-guides");
      setGuides(res.data);
    } catch (error) {
      toast.error("Failed to load guides");
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setOrder(0);
    setEditingId(null);
  };

  const saveGuide = async () => {
    if (!title || !content) {
      return toast.error("Title and content required");
    }

    try {
      if (editingId) {
        await API.put(
          `/reseller-guides/${editingId}`,
          { title, content, order },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Guide updated");
      } else {
        await API.post(
          "/reseller-guides",
          { title, content, order },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Guide created");
      }

      resetForm();
      fetchGuides();
    } catch (error) {
      toast.error("Failed to save guide");
    }
  };

  const editGuide = (guide) => {
    setTitle(guide.title);
    setContent(guide.content);
    setOrder(guide.order);
    setEditingId(guide._id);
  };

  const deleteGuide = async (id) => {
    if (!window.confirm("Delete this guide?")) return;

    try {
      await API.delete(`/reseller-guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Guide deleted");
      fetchGuides();
    } catch (error) {
      toast.error("Failed to delete guide");
    }
  };

  const toggleVisibility = async (guide) => {
    try {
      await API.put(
        `/reseller-guides/${guide._id}`,
        { visible: !guide.visible },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Guide updated");
      fetchGuides();
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Reseller Guides
          </h1>
          <p className="text-sm text-gray-500">
            Manage onboarding guides shown to reseller users
          </p>
        </div>

        {/* CREATE / EDIT GUIDE */}

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
              className="border rounded-lg px-3 py-2 w-full"
            />

            <input
              type="number"
              placeholder="Order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />

          </div>

          <textarea
            placeholder="Guide Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mt-4"
            rows="4"
          />

          <div className="flex gap-3 mt-4">

            <button
              onClick={saveGuide}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {editingId ? "Update Guide" : "Create Guide"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </div>

        {/* GUIDES TABLE */}

        <div className="bg-white shadow-sm rounded-xl border overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50 border-b text-sm text-gray-600">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Order</th>
                <th className="p-4 text-left">Visible</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              {guides.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    No guides created yet
                  </td>
                </tr>
              )}

              {guides.map((guide) => (

                <tr
                  key={guide._id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">
                    {guide.title}
                  </td>

                  <td className="p-4">
                    {guide.order}
                  </td>

                  <td className="p-4">

                    <button
                      onClick={() => toggleVisibility(guide)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        guide.visible
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
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
  );
};

export default AdminResellerGuides;
