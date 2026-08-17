// src/templates/pulse/PulseSupport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import { useSupport } from "../../context/SupportContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiPlus, FiHeadphones, FiX, FiPaperclip, FiSend } from "react-icons/fi";

const STATUS = {
  open:        { bg: "#dbeafe", color: "#2563eb" },
  in_progress: { bg: "#fef9c3", color: "#ca8a04" },
  closed:      { bg: "#f3f4f6", color: "#6b7280" },
};

export default function PulseSupport() {
  const navigate = useNavigate();
  const { userScope, refreshUser } = useSupport();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#6366f1" };
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
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4 → max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xl font-black text-gray-900">Support</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-2xl font-bold text-white"
            style={{ background: brand.color, boxShadow: `0 4px 12px ${brand.color}44` }}
          >
            <FiPlus size={13} /> New
          </button>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-2xl text-sm font-semibold text-center ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-gray-300">
              <FiHeadphones size={36} className="mb-3" />
              <p className="font-bold text-gray-500 text-sm">No tickets yet</p>
              <p className="text-xs mt-1 text-gray-400">Open a ticket to reach support</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map((ticket) => {
                const u    = unread(ticket);
                const meta = STATUS[ticket.status] || STATUS.open;
                const last = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <button
                    key={ticket._id}
                    onClick={() => navigate(`/support/${ticket._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}12` }}>
                      <FiHeadphones size={16} style={{ color: brand.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-800 text-sm truncate">{ticket.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {last?.text || (last?.file ? "📎 Attachment" : "No messages")}
                      </p>
                    </div>
                    {u > 0 && (
                      <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 flex-shrink-0">
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

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm">New Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                <FiX size={16} />
              </button>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-2xl text-sm font-semibold ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Topic</label>
              <select
                value={selCat}
                onChange={e => setSelCat(e.target.value)}
                className="w-full border border-gray-100 rounded-2xl px-4 py-2.5 text-sm bg-gray-50 outline-none text-gray-800"
              >
                <option value="">— Select a topic —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.label}</option>)}
                <option value="__other__">Other (enter manually)</option>
              </select>
            </div>

            {isOther && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Your Title</label>
                <input
                  type="text"
                  value={custTitle}
                  onChange={e => setCustTitle(e.target.value)}
                  placeholder="Briefly describe your issue..."
                  className="w-full border border-gray-100 rounded-2xl px-4 py-2.5 text-sm bg-gray-50 outline-none text-gray-800"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Explain your issue in detail..."
                rows={4}
                className="w-full border border-gray-100 rounded-2xl px-4 py-2.5 text-sm bg-gray-50 outline-none text-gray-800 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Attachment <span className="text-gray-400 font-normal normal-case">(optional, max 5MB)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl px-4 py-3 cursor-pointer">
                <FiPaperclip size={14} style={{ color: brand.color }} />
                <span className="text-sm text-gray-500">{filePrev ? filePrev.name : "Choose image or PDF"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
              </label>
              {filePrev?.type?.startsWith("image/") && (
                <div className="mt-2 relative inline-block">
                  <img src={filePrev.url} alt="preview" className="h-20 rounded-2xl object-cover border border-gray-100" />
                  <button onClick={() => { setFile(null); setFilePrev(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-white font-bold rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: brand.color, boxShadow: `0 4px 16px ${brand.color}44` }}
            >
              {submitting ? "Submitting..." : <><FiSend size={14} /> Submit Ticket</>}
            </button>
          </div>
        </div>
      )}
    </PulseLayout>
  );
}
