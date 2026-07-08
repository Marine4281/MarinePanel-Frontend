import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSupport } from "../context/SupportContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

const STATUS_META = {
  open:        { label: "Open",        cls: "bg-blue-100 text-blue-600" },
  in_progress: { label: "In Progress", cls: "bg-orange-100 text-orange-600" },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500" },
};

export default function SupportPage() {
  const navigate = useNavigate();
  const { userUnread, fmt, refreshUser, userScope } = useSupport();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [file, setFile]             = useState(null);
  const [filePrev, setFilePrev]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const panelOwner = domainType === "childPanel" ? childPanel?._id : undefined;

  const loadTickets = () => {
    setLoading(true);
    API.get("/support/my-tickets", { params: { scope: userScope } })
      .then(r => setTickets(r.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTickets(); refreshUser(); }, [userScope]);

  useEffect(() => {
    API.get("/support/categories", { params: { scope: userScope, ...(panelOwner ? { panelOwner } : {}) } })
      .then(r => setCategories(r.data))
      .catch(() => setCategories([]));
  }, [userScope, panelOwner]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setError("File must be under 5MB");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ data: ev.target.result.split(",")[1], mimeType: f.type, fileName: f.name });
      setFilePrev({ url: ev.target.result, name: f.name, type: f.type });
    };
    reader.readAsDataURL(f);
  };

  const submitTicket = async () => {
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both a subject and a description.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post("/support/tickets", {
        title: title.trim(),
        description: description.trim(),
        ...(file ? { file } : {}),
      });
      setShowForm(false);
      setTitle(""); setDesc(""); setFile(null); setFilePrev(null);
      loadTickets();
      navigate(`/support/${res.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });
  const lastMessage = (t) => t.messages?.[t.messages.length - 1]?.text || "No messages yet";
  const unreadFor = (t) => t.messages?.filter(m => m.sender === "admin" && !m.seenByUser).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-headset text-orange-500" /> Support Tickets
              {userUnread > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {fmt(userUnread)} new
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Get help from our support team</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow transition">
            <i className="fas fa-plus mr-1.5" /> New Ticket
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <p className="font-bold text-gray-800 mb-3">New Support Ticket</p>
            {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-3 py-2 text-sm mb-3">{error}</div>}

            {categories.length > 0 && (
              <select onChange={(e) => e.target.value && setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="">Select a category (optional)</option>
                {categories.map(c => <option key={c._id} value={c.label}>{c.label}</option>)}
              </select>
            )}

            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Subject"
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />

            <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Describe your issue..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300" />

            {filePrev && (
              <div className="flex items-center gap-3 mb-3 bg-gray-50 rounded-xl p-2">
                {filePrev.type.startsWith("image/")
                  ? <img src={filePrev.url} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                  : <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center"><i className="fas fa-file text-orange-400" /></div>}
                <p className="flex-1 text-xs text-gray-600 truncate">{filePrev.name}</p>
                <button onClick={() => { setFile(null); setFilePrev(null); }} className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center"><i className="fas fa-times text-xs" /></button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <i className="fas fa-paperclip" /> Attach file
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">Cancel</button>
                <button onClick={submitTicket} disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
                  {submitting ? <i className="fas fa-spinner fa-spin" /> : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-orange-400"><i className="fas fa-spinner fa-spin text-2xl" /></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-inbox text-3xl mb-3" />
            <p className="text-sm">No support tickets yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map(t => {
              const meta = STATUS_META[t.status] || STATUS_META.open;
              const unread = unreadFor(t);
              return (
                <button key={t._id} onClick={() => navigate(`/support/${t._id}`)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <i className="fas fa-comment-dots text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-800 truncate">{t.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{lastMessage(t)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400">{fmtDate(t.updatedAt)}</p>
                    {unread > 0 && (
                      <span className="inline-block mt-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{fmt(unread)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
