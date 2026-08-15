// src/templates/neon/NeonSupport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import { useSupport } from "../../context/SupportContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiPlus, FiHeadphones, FiX, FiPaperclip, FiSend } from "react-icons/fi";

const STATUS = {
  open:        { label: "Open",        color: "#38bdf8" },
  in_progress: { label: "In Progress", color: "#fbbf24" },
  closed:      { label: "Closed",      color: "#6c6c92" },
};

export default function NeonSupport() {
  const navigate = useNavigate();
  const { userScope, refreshUser } = useSupport();
  const { childPanel } = useChildPanel();

  const neon = childPanel?.themeColor || "#00ff88";
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

  const inputStyle = {
    background: "#1b1b2a",
    border: `1px solid ${neon}22`,
    color: "#c4c4e0",
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
  };

  return (
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Help</p>
            <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Support</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
            style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14", boxShadow: `0 0 20px ${neon}33` }}
          >
            <FiPlus size={14} /> New Ticket
          </button>
        </div>

        {msg.text && (
          <div
            className="p-3 rounded-xl text-sm font-semibold text-center"
            style={msg.ok ? { background: "#0f2a1c", color: "#4ade80", border: "1px solid #16a34a33" } : { background: "#2a1414", color: "#f87171", border: "1px solid #dc262633" }}
          >
            {msg.text}
          </div>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${neon} transparent transparent transparent` }} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center py-16" style={{ color: "#5c5c82" }}>
              <FiHeadphones size={40} className="mb-3" style={{ color: `${neon}44` }} />
              <p className="font-bold text-sm" style={{ color: "#8888a8" }}>No tickets yet</p>
              <p className="text-xs mt-1">Open a ticket to reach our support team</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: `${neon}0a` }}>
              {tickets.map((ticket) => {
                const u    = unread(ticket);
                const meta = STATUS[ticket.status] || STATUS.open;
                const last = ticket.messages?.[ticket.messages.length - 1];
                return (
                  <button
                    key={ticket._id}
                    onClick={() => navigate(`/support/${ticket._id}`)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${neon}14` }}>
                      <FiHeadphones size={16} style={{ color: neon }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm truncate" style={{ color: "#c4c4e0" }}>{ticket.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: meta.color, border: `1px solid ${meta.color}44` }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: "#5c5c82" }}>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto" style={{ background: "#181828", border: `1px solid ${neon}22` }}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm" style={{ color: neon }}>New Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#1b1b2a", color: "#8888a8" }}>
                <FiX size={16} />
              </button>
            </div>

            {msg.text && (
              <div className="p-3 rounded-xl text-sm font-semibold" style={msg.ok ? { background: "#0f2a1c", color: "#4ade80" } : { background: "#2a1414", color: "#f87171" }}>
                {msg.text}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: `${neon}55` }}>Topic</label>
              <select value={selCat} onChange={e => setSelCat(e.target.value)} style={inputStyle}>
                <option value="" style={{ background: "#1b1b2a" }}>— Select a topic —</option>
                {categories.map(c => <option key={c._id} value={c._id} style={{ background: "#1b1b2a" }}>{c.label}</option>)}
                <option value="__other__" style={{ background: "#1b1b2a" }}>Other (enter manually)</option>
              </select>
            </div>

            {isOther && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: `${neon}55` }}>Your Title</label>
                <input type="text" value={custTitle} onChange={e => setCustTitle(e.target.value)} placeholder="Briefly describe your issue..." style={inputStyle} />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: `${neon}55` }}>Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Explain your issue in detail..." rows={4} style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest mb-1 block" style={{ color: `${neon}55` }}>
                Attachment <span style={{ color: "#5c5c82", fontWeight: 400 }}>(optional, max 5MB)</span>
              </label>
              <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer" style={{ border: `1px dashed ${neon}33` }}>
                <FiPaperclip size={14} style={{ color: neon }} />
                <span className="text-sm" style={{ color: "#8888a8" }}>{filePrev ? filePrev.name : "Choose image or PDF"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
              </label>
              {filePrev?.type?.startsWith("image/") && (
                <div className="mt-2 relative inline-block">
                  <img src={filePrev.url} alt="preview" className="h-20 rounded-xl object-cover" style={{ border: `1px solid ${neon}22` }} />
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
              className="w-full font-black rounded-xl py-3 text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${neon}dd, ${neon}99)`, color: "#0a0a14" }}
            >
              {submitting ? "Submitting..." : <><FiSend size={14} /> Submit Ticket</>}
            </button>
          </div>
        </div>
      )}
    </NeonLayout>
  );
              }
