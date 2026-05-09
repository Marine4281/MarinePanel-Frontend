//src/pages/reseller/AdminResellerGuides.jsx

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";

const AdminResellerGuides = () => {
  const [guides, setGuides] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(0);

  // NEW
  const [visible, setVisible] = useState(true);
  const [placement, setPlacement] = useState("activation");

  const [editingId, setEditingId] = useState(null);

  /*
  --------------------------------
  Fetch Guides
  --------------------------------
  */
  const fetchGuides = async () => {
    try {
      const res = await API.get("/reseller-guides");
      setGuides(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load guides");
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  /*
  --------------------------------
  Reset Form
  --------------------------------
  */
  const resetForm = () => {
    setTitle("");
    setContent("");
    setOrder(0);

    // NEW
    setVisible(true);
    setPlacement("activation");

    setEditingId(null);
  };

  /*
  --------------------------------
  Save Guide
  --------------------------------
  */
  const saveGuide = async () => {
    if (!title || !content) {
      return toast.error("Title and content required");
    }

    try {
      const payload = {
        title,
        content,
        order: Number(order),
        visible,
        placement,
      };

      if (editingId) {

        await API.put(
          `/reseller-guides/${editingId}`,
          payload
        );

        toast.success("Guide updated");

      } else {

        await API.post(
          "/reseller-guides",
          payload
        );

        toast.success("Guide created");

      }

      resetForm();
      fetchGuides();

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to save guide"
      );
    }
  };

  /*
  --------------------------------
  Edit Guide
  --------------------------------
  */
  const editGuide = (guide) => {
    setTitle(guide.title);

    setContent(guide.content);

    setOrder(guide.order || 0);

    // NEW
    setVisible(
      guide.visible !== undefined
        ? guide.visible
        : true
    );

    setPlacement(
      guide.placement || "activation"
    );

    setEditingId(guide._id);
  };

  /*
  --------------------------------
  Delete Guide
  --------------------------------
  */
  const deleteGuide = async (id) => {
    if (!window.confirm("Delete this guide?")) return;

    try {

      await API.delete(
        `/reseller-guides/${id}`
      );

      toast.success("Guide deleted");

      fetchGuides();

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete guide"
      );
    }
  };

  /*
  --------------------------------
  Toggle Visibility
  --------------------------------
  */
  const toggleVisibility = async (guide) => {
    try {

      await API.put(
        `/reseller-guides/${guide._id}`,
        {
          visible: !guide.visible,
        }
      );

      toast.success("Guide updated");

      fetchGuides();

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to update visibility"
      );
    }
  };

  /*
  --------------------------------
  Placement Badge Color
  --------------------------------
  */
  const placementColor = (placement) => {
    switch (placement) {

      case "activation":
        return "bg-blue-100 text-blue-700";

      case "dashboard":
        return "bg-purple-100 text-purple-700";

      case "both":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";

    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <main className="flex-1 p-8">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-2xl font-bold text-gray-800">
            Reseller Guides
          </h1>

          <p className="text-sm text-gray-500">
            Manage onboarding guides shown to reseller users
          </p>

        </div>

        {/* CREATE / EDIT FORM */}

        <div className="bg-white shadow-sm rounded-xl p-6 mb-8 border">

          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Guide" : "Create Guide"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            {/* TITLE */}

            <input
              type="text"
              placeholder="Guide Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />

            {/* ORDER */}

            <input
              type="number"
              placeholder="Order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />

          </div>

          {/* CONTENT */}

          <textarea
            placeholder="Guide Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mt-4"
            rows="5"
          />

          {/* SETTINGS */}

          <div className="grid md:grid-cols-2 gap-4 mt-4">

            {/* PLACEMENT */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Guide On
              </label>

              <select
                value={placement}
                onChange={(e) =>
                  setPlacement(e.target.value)
                }
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="activation">
                  Activation Page
                </option>

                <option value="dashboard">
                  Dashboard Guides
                </option>

                <option value="both">
                  Both
                </option>

              </select>

            </div>

            {/* VISIBILITY */}

            <div className="flex items-center gap-3 mt-8">

              <input
                type="checkbox"
                id="visible"
                checked={visible}
                onChange={(e) =>
                  setVisible(e.target.checked)
                }
                className="w-4 h-4"
              />

              <label
                htmlFor="visible"
                className="text-sm text-gray-700"
              >
                Visible to users
              </label>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex gap-3 mt-6">

            <button
              onClick={saveGuide}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              {editingId
                ? "Update Guide"
                : "Create Guide"}
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

                <th className="p-4 text-left">
                  Title
                </th>

                <th className="p-4 text-left">
                  Order
                </th>

                <th className="p-4 text-left">
                  Placement
                </th>

                <th className="p-4 text-left">
                  Visible
                </th>

                <th className="p-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {guides.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-400"
                  >
                    No guides created yet
                  </td>

                </tr>

              )}

              {guides.map((guide) => (

                <tr
                  key={guide._id}
                  className="border-b hover:bg-gray-50"
                >

                  {/* TITLE */}

                  <td className="p-4 font-medium text-gray-800">
                    {guide.title}
                  </td>

                  {/* ORDER */}

                  <td className="p-4">
                    {guide.order}
                  </td>

                  {/* PLACEMENT */}

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${placementColor(
                        guide.placement
                      )}`}
                    >
                      {guide.placement}
                    </span>

                  </td>

                  {/* VISIBILITY */}

                  <td className="p-4">

                    <button
                      onClick={() =>
                        toggleVisibility(guide)
                      }
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        guide.visible
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {guide.visible
                        ? "Visible"
                        : "Hidden"}
                    </button>

                  </td>

                  {/* ACTIONS */}

                  <td className="p-4 text-right space-x-3">

                    <button
                      onClick={() => editGuide(guide)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteGuide(guide._id)
                      }
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
