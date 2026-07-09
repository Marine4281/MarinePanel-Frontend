// src/components/childpanel/settings/CurrencyTab.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaStar, FaRegStar, FaEdit } from "react-icons/fa";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { Field, Input, SaveBtn } from "./SettingsShared";

const emptyForm = { name: "", code: "", symbol: "", rate: "", isDefault: false };

export default function CurrencyTab() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/currencies/cp");
      setCurrencies(data.currencies || []);
    } catch (err) {
      console.error("Failed to fetch currencies:", err);
      toast.error("Failed to load currencies");
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
      toast.error("Name, code, symbol, and rate are all required");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await API.put(`/currencies/cp/${editingId}`, { ...form, rate: Number(form.rate) });
        toast.success("Currency updated");
      } else {
        await API.post("/currencies/cp", { ...form, rate: Number(form.rate) });
        toast.success("Currency added");
      }
      resetForm();
      fetchCurrencies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save currency");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this currency? Users who selected it will fall back to USD.")) return;
    try {
      await API.delete(`/currencies/cp/${id}`);
      toast.success("Currency deleted");
      fetchCurrencies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete currency");
    }
  };

  const handleToggleDefault = async (c) => {
    try {
      await API.put(`/currencies/cp/${c._id}`, { isDefault: !c.isDefault });
      fetchCurrencies();
    } catch (err) {
      toast.error("Failed to update default currency");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-md font-semibold text-gray-800">Currency Options</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add currencies your users can pick for display. Wallet balances and orders always
            stay calculated in USD behind the scenes — this only changes what your users see.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          <FaPlus className="text-[10px]" /> {showForm ? "Cancel" : "Add Currency"}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Field label="Currency Name" hint="e.g. Kenyan Shilling">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Kenyan Shilling" />
          </Field>
          <Field label="Code" hint="e.g. KES">
            <Input value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} placeholder="KES" />
          </Field>
          <Field label="Symbol" hint="e.g. KSh">
            <Input value={form.symbol} onChange={(v) => setForm({ ...form, symbol: v })} placeholder="KSh" />
          </Field>
          <Field label="Rate" hint="1 USD = ? in this currency">
            <Input type="number" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} placeholder="130" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default currency for new users
          </label>
          <div className="sm:col-span-2">
            <SaveBtn loading={saving} onClick={handleSave} label={editingId ? "Update Currency" : "Create Currency"} />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Loading currencies...</p>
      ) : currencies.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          No currencies added yet. Your users only see USD until you add one.
        </p>
      ) : (
        <div className="divide-y border rounded-xl border-gray-100">
          {currencies.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleDefault(c)} title="Set as default">
                  {c.isDefault ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.symbol} {c.code} — {c.name}</p>
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
    }
