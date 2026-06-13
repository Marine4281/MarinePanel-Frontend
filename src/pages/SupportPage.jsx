import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSupport } from "../context/SupportContext";
import { useCachedServices } from "../context/CachedServicesContext";
import { useChildPanel } from "../context/ChildPanelContext";

const STATUS = {
  open:        { label: "Open",        cls: "bg-blue-100 text-blue-600" },
  in_progress: { label: "In Progress", cls: "bg-orange-100 text-orange-600" },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500" },
};

export default function SupportPage() {
  const navigate = useNavigate();
  const { userScope, refreshUser } = useSupport();
  const { domainType } = useCachedServices();
  const { childPanel } = useChildPanel();

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

  const panelOwnerId = domainType === "childPanel" ? childPanel?.ownerId || null : null;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Support</h1>
            <p className="text-sm text-gray-500 mt-0.5">Submit and track your support tickets</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition shadow"
          >
            <i className="fas fa-plus" /> New Ticket
          </button>
        </div>

        {msg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-semibold text-center ${msg.ok ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-orange-400">
            <i className="fas fa-spinner fa-spin text-3xl" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <i className="fas fa-headset text-5xl mb-3" />
            <p className="font-bold text-gray-600 text-lg">No tickets yet</p>
            <p className="text-sm mt-1 mb-4">Open a ticket to reach our support team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => {
              const u   = unread(ticket);
              const meta = STATUS[ticket.status] || STATUS.open;
              const last = ticket.messages?.[ticket.messages.length - 1];
              return (
                <div
                  key={ticket._id}
                  onClick={() => navigate(`/support/${ticket._id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition active:scale-[0.99]"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <i className="fas fa-headset text-orange-500 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-800 text-sm truncate">{ticket.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {last?.text || (last?.file ? "📎 Attachment" : "No messages")}
                    </p>
                  </div>
                  {u > 0 && (
                    <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 animate-bounce shadow shrink-0">
                      {u > 99 ? "99+" : u}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* New Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-800 text-base">New Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <i className="fas fa-times text-sm" />
              </button>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-xl text-sm font-semibold ${msg.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Topic</label>
              <select
                value={selCat}
                onChange={e => setSelCat(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Attachment <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl px-4 py-3 cursor-pointer transition">
                <i className="fas fa-paperclip text-orange-400" />
                <span className="text-sm text-gray-500">{filePrev ? filePrev.name : "Choose image or PDF"}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
              </label>
              {filePrev?.type?.startsWith("image/") && (
                <div className="mt-2 relative inline-block">
                  <img src={filePrev.url} alt="preview" className="h-20 rounded-xl object-cover border border-gray-200" />
                  <button onClick={() => { setFile(null); setFilePrev(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow">
                    <i className="fas fa-times" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm transition flex items-center justify-center gap-2"
            >
              {submitting ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : <><i className="fas fa-paper-plane" /> Submit Ticket</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
        }
