// src/components/admin/AdminCurrencySettings.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaStar, FaRegStar, FaEdit } from "react-icons/fa";
import API from "../../api/axios";

const emptyForm = { name: "", code: "", symbol: "", rate: "", isDefault: false };

const AdminCurrencySettings = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/currencies/admin");
      setCurrencies(data.currencies || []);
    } catch (err) {
      console.error("Failed to fetch currencies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, code: c.code, symbol: c.symbol, rate: c.rate, isDefault: c.isDefault });
    setEditingId(c._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code || !form.symbol || form.rate === "") {
      alert("Name, code, symbol, and rate are all required");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await API.put(`/currencies/admin/${editingId}`, { ...form, rate: Number(form.rate) });
      } else {
        await API.post("/currencies/admin", { ...form, rate: Number(form.rate) });
      }
      resetForm();
      fetchCurrencies();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save currency");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this currency? Users who selected it will fall back to USD.")) return;
    try {
      await API.delete(`/currencies/admin/${id}`);
      fetchCurrencies();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete currency");
    }
  };

  const handleToggleDefault = async (c) => {
    try {
      await API.put(`/currencies/admin/${c._id}`, { isDefault: !c.isDefault });
      fetchCurrencies();
    } catch (err) {
      alert("Failed to update default currency");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Currency Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Display-only currencies users can select. Wallet balances and orders always stay calculated in USD.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm"
        >
          <FaPlus className="text-xs" /> {showForm ? "Cancel" : "Add Currency"}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
          <input
            type="text" placeholder="Name (e.g. Kenyan Shilling)"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2.5 rounded-lg text-sm sm:col-span-2"
          />
          <input
            type="text" placeholder="Code (e.g. KES)" maxLength={6}
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="border p-2.5 rounded-lg text-sm"
          />
          <input
            type="text" placeholder="Symbol (e.g. KSh)"
            value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="border p-2.5 rounded-lg text-sm"
          />
          <input
            type="number" step="0.0001" placeholder="Rate (1 USD = ?)"
            value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })}
            className="border p-2.5 rounded-lg text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Saving..." : editingId ? "Update Currency" : "Create Currency"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Loading currencies...</p>
      ) : currencies.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No currencies added yet. Users only see USD until you add one.
        </p>
      ) : (
        <div className="divide-y">
          {currencies.map((c) => (
            <div key={c._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleDefault(c)} title="Set as default">
                  {c.isDefault ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium">{c.symbol} {c.code} — {c.name}</p>
                  <p className="text-xs text-gray-400">1 USD = {c.rate} {c.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleEdit(c)} className="text-gray-400 hover:text-blue-600">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCurrencySettings;
