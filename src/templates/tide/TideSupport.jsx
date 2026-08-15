// src/templates/tide/TideSupport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import { useSupport } from "../../context/SupportContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import {
  FiPlus, FiHeadphones, FiX, FiPaperclip, FiSend,
} from "react-icons/fi";

const STATUS = {
  open:        { label: "Open",        bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  in_progress: { label: "In Progress", bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  closed:      { label: "Closed",      bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

export default function TideSupport() {
  const navigate = useNavigate();
  const { userScope, refreshUser } = useSupport();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };
  const panelOwnerId = childPanel?.ownerId || null;

  const [tickets,    setTickets]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg,        setMsg]        = useState({ text: "", ok: true });

  const [selCat,    setSelCat]    = useState("");
  const [custTitle, setCustTitle] = useState("");
  const [desc,      setDesc]      = useState("");
  const [file,      setFile]      = useState(null);
  const [filePrev,  setFilePrev]  = useState(null);

  const flash = (t, ok = true) => { setMsg({ text: t, ok }); setTimeout(() => setMsg({ text: "", ok: true }), 3500); };

  const load = () => {
    setLoading(true);
    Promise.all([
      API.get(`/support/my-tickets?scope=${userScope}`),
      API.get(`/support/categories?scope=${userScope}${panelOwnerId ? `&panelOwner=${panelOwnerId}` : ""}`),
    ])
      .then(([t, c]) => { setTickets(t.data); setCategories(c.data); })
      .catch(() => flash("Failed to load tickets", false))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [userScope]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { flash("File must be under 5MB", false); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ data: ev.target.result.split(",")[1], mimeType: f.type, fileName: f.name });
      setFilePrev({ url: ev.target.result, name: f.name, type: f.type });
    };
    reader.readAsDataURL(f);
  };

  const isOther    = selCat === "__other__";
  const finalTitle = isOther ? custTitle.trim() : (categories.find(c => c._id === selCat)?.label || "");

  const handleSubmit = async () => {
    if (!finalTitle) return flash("Please select or enter a title", false);
    if (!desc.trim()) return flash("Description is required", false);
    setSubmitting(true);
    try {
      const res = await API.post("/support/tickets", {
        title: finalTitle,
        description: desc.trim(),
        ...(file ? { file } : {}),
      });
      setShowForm(false);
      setSelCat(""); setCustTitle(""); setDesc(""); setFile(null); setFilePrev(null);
      flash("Ticket submitted!");
      load(); refreshUser();
      navigate(`/support/${res.data._id}`);
    } catch (e) { flash(e.response?.data?.message || "Failed", false); }
    setSubmitting(false);
  };

  const unread = (t) => t.messages?.filter(m => m.sender === "admin" && !m.seenByUser).length || 0;

  return (
    <TideLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-gray-900">Support</h2>
            <p className="text-xs text-gray-400">Submit and track your support tickets</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: brand.color, boxShadow: `0 3px 10px ${brand.color}44` }}
          >
            <FiPlus size={14} /> New Ticket
          </button>
        </div>

        {msg.text && (
          <div
            className="p-3 rounded-xl text-sm font-semibold text-center"
            style={
              msg.ok
                ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
                : { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }
            }
          >
            {msg.text}
          </div>
        )}

        {/* Ticket list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <FiHeadphones size={44} className="mb-3" style={{ color: `${brand.color}55` }} />
              <p className="font-bold text-gray-600 text-base">No tickets yet</p>
              <p className="text-sm mt-1">Open a ticket to reach our support team</p>
            </div>
          ) : (
            <div>
              {tickets.map((ticket) => {
                const u    = unread(ticket);
                const meta = STATUS[ticket.status] || STATUS.open;
                const last = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <button
                    key={ticket._id}
                    onClick={() => navigate(`/support/${ticket._id}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${brand.color}1a` }}
                    >
                      <FiHeadphones size={18} style={{ color: brand.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-800 text-sm truncate">{ticket.title}</p>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {last?.text || (last?.file ? "📎 Attachment" : "No messages")}
                      </p>
                    </div>
                    {u > 0 && (
                      <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shrink-0">
                        {u > 99 ? "99+" : u}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-800 text-base">New Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <FiX size={16} />
              </button>
            </div>

            {msg.text && (
              <div
                className="p-3 rounded-xl text-sm font-semibold"
                style={msg.ok ? { background: "#f0fdf4", color: "#15803d" } : { background: "#fef2f2", color: "#b91c1c" }}
              >
                {msg.text}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Topic</label>
              <select
                value={selCat}
                onChange={e => setSelCat(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
              >
                <option value="">— Select a topic —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.label}</option>)}
                <option value="__other__">Other (enter manually)</option>
              </select>
            </div>

            {isOther && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Title</label>
                <input
                  type="text"
                  value={custTitle}
                  onChange={e => setCustTitle(e.target.value)}
                  placeholder="Briefly describe your issue..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Explain your issue in detail..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Attachment <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer transition">
                <FiPaperclip size={14} style={{ color: brand.color }} />
                <span className="text-sm text-gray-500">{filePrev ? filePrev.name : "Choose image or PDF"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
              </label>
              {filePrev?.type?.startsWith("image/") && (
                <div className="mt-2 relative inline-block">
                  <img src={filePrev.url} alt="preview" className="h-20 rounded-xl object-cover border border-gray-200" />
                  <button onClick={() => { setFile(null); setFilePrev(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow">
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-white font-bold rounded-xl py-3 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: brand.color }}
            >
              {submitting ? "Submitting..." : <><FiSend size={14} /> Submit Ticket</>}
            </button>
          </div>
        </div>
      )}
    </TideLayout>
  );
}
