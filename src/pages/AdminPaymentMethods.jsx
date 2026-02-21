import { useEffect, useState } from "react";
import API from "../api/axios"; // Axios instance
import Header from "../components/Sidebar"; // Sidebar component
import toast from "react-hot-toast";

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "",
    minDeposit: "",
    description: "",
    isVisible: true,
  });

  // Fetch all payment methods
  const fetchMethods = async () => {
    try {
      const response = await API.get("/admin/payment-methods");
      setMethods(response.data.methods || []);
    } catch (err) {
      toast.error("Failed to load methods");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Toggle visibility
  const handleToggleVisibility = async (id, current) => {
    try {
      await API.patch(`/admin/payment-methods/${id}`, { isVisible: !current });
      fetchMethods();
    } catch (err) {
      toast.error("Failed to update visibility");
      console.error(err);
    }
  };

  // Add new provider
  const handleAddProvider = async () => {
    if (!newMethod.name || !newMethod.type) {
      return toast.error("Name and type are required");
    }

    if (newMethod.minDeposit && Number(newMethod.minDeposit) < 0) {
      return toast.error("Min Deposit must be at least 0");
    }

    try {
      const payload = {
        name: newMethod.name,
        type: newMethod.type.toLowerCase(),
        minDeposit: Number(newMethod.minDeposit),
        description: newMethod.description,
        isVisible: newMethod.isVisible,
      };

      await API.post("/admin/payment-methods", payload);
      toast.success("Payment method added");

      setNewMethod({
        name: "",
        type: "",
        minDeposit: "",
        description: "",
        isVisible: true,
      });

      fetchMethods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add method");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto mt-8 px-4 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Admin Payment Methods</h2>

        {/* Methods Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Min Deposit</th>
                <th className="p-3">Visible</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.length > 0 ? (
                methods.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td className="p-3">{m.name}</td>
                    <td className="p-3">{m.type}</td>
                    <td className="p-3">{m.minDeposit}</td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={m.isVisible}
                        onChange={() => handleToggleVisibility(m._id, m.isVisible)}
                      />
                    </td>
                    <td className="p-3">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No payment methods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Provider Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Provider Name"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
              className="p-3 border rounded-xl"
            />

            <select
              value={newMethod.type}
              onChange={(e) =>
                setNewMethod({ ...newMethod, type: e.target.value.toLowerCase() })
              }
              className="p-3 border rounded-xl"
            >
              <option value="">Select Method Type</option>
              <option value="card">Card</option>
              <option value="mpesa">Mpesa</option>
              <option value="bank">Bank</option>
              <option value="manual">Manual</option>
            </select>

            <input
              type="number"
              placeholder="Min Deposit"
              value={newMethod.minDeposit}
              onChange={(e) =>
                setNewMethod({ ...newMethod, minDeposit: e.target.value })
              }
              className="p-3 border rounded-xl"
            />

            <input
              type="text"
              placeholder="Description / Instructions"
              value={newMethod.description}
              onChange={(e) =>
                setNewMethod({ ...newMethod, description: e.target.value })
              }
              className="p-3 border rounded-xl"
            />
          </div>

          <button
            onClick={handleAddProvider}
            className="mt-4 w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600"
          >
            Add Payment Method
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminPaymentMethods;
