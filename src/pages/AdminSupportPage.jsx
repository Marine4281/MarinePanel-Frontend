import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useSupport } from "../context/SupportContext";

const STATUS_META = {
  open:        { label: "Open",        cls: "bg-blue-100 text-blue-600",    dot: "bg-blue-500" },
  in_progress: { label: "In Progress", cls: "bg-orange-100 text-orange-600", dot: "bg-orange-500" },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
};

export default function AdminSupportPage() {
  const { adminUnread, fmt, refreshAdmin } = useSupport();
  const [tab, setTab]                 = useState("tickets");
  const [tickets, setTickets]         = useState([]);
  const [activeTicket, setActive]     = useState(null);
  const [ticketLoading, setTLoading]  = useState(true);
  const [filterStatus, setFilter]     = useState("");
  const [replyText, setReplyText]     = useState("");
  const [replyFile, setReplyFile]     = useState(null);
  const [replyFilePrev, setReplyFilePrev] = useState(null);
  const [sending, setSending]         = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [categories, setCategories]   = useState([]);
  const [catLoading, setCatLoading]   = useState(false);
  const [newLabel, setNewLabel]       = useState("");
  const [editCat, setEditCat]         = useState(null);
  const [editLabel, setEditLabel]     = useState("");
  const [catMsg, setCatMsg]           = useState({ text: "", ok: true });
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const flashCat = (t, ok = true) => { setCatMsg({ text: t, ok }); setTimeout(() => setCatMsg({ text: "", ok: true }), 3000); };

  // ── Tickets ────────────────────────────────────────────────────
  const loadTickets = (silent = false) => {
    if (!silent) setTLoading(true);
    API.get("/support/admin/tickets", { params: filterStatus ? { status: filterStatus } : {} })
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setTLoading(false));
  };

  useEffect(() => { loadTickets(); }, [filterStatus]);

  const openTicket = async (id) => {
    setChatLoading(true);
    try {
      const r = await API.get(`/support/admin/tickets/${id}`);
      setActive(r.data);
      refreshAdmin();
      loadTickets(true);
    } catch {}
    setChatLoading(false);
  };

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeTicket) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await API.get(`/support/admin/tickets/${activeTicket._id}`);
        setActive(r.data); refreshAdmin();
      } catch {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeTicket?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeTicket?.messages?.length]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return alert("File must be under 5MB");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReplyFile({ data: ev.target.result.split(",")[1], mimeType: f.type, fileName: f.name });
      setReplyFilePrev({ url: ev.target.result, name: f.name, type: f.type });
    };
    reader.readAsDataURL(f);
  };

  const handleSend = async () => {
    if (!replyText.trim() && !replyFile) return;
    setSending(true);
    try {
      await API.post(`/support/admin/tickets/${activeTicket._id}/reply`, {
        text: replyText.trim(), ...(replyFile ? { file: replyFile } : {}),
      });
      setReplyText(""); setReplyFile(null); setReplyFilePrev(null);
      const r = await API.get(`/support/admin/tickets/${activeTicket._id}`);
      setActive(r.data); loadTickets(true);
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    setSending(false);
  };

  const changeStatus = async (status) => {
    try {
      const r = await API.put(`/support/admin/tickets/${activeTicket._id}/status`, { status });
      setActive(r.data); loadTickets(true);
    } catch {}
  };

  const deleteTicket = async (id) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      await API.delete(`/support/admin/tickets/${id}`);
      if (activeTicket?._id === id) setActive(null);
      loadTickets(true);
    } catch {}
  };

  // ── Categories ─────────────────────────────────────────────────
  const loadCats = () => {
    setCatLoading(true);
    API.get("/support/admin/categories")
      .then(r => setCategories(r.data))
      .catch(() => flashCat("Failed to load", false))
      .finally(() => setCatLoading(false));
  };

  useEffect(() => { if (tab === "categories") loadCats(); }, [tab]);

  const createCat = async () => {
    if (!newLabel.trim()) return flashCat("Label required", false);
    try { await API.post("/support/admin/categories", { label: newLabel.trim() }); setNewLabel(""); flashCat("✅ Added!"); loadCats(); }
    catch (e) { flashCat(e.response?.data?.message || "Failed", false); }
  };
  const saveCat = async (id) => {
    if (!editLabel.trim()) return;
    try { await API.put(`/support/admin/categories/${id}`, { label: editLabel.trim() }); setEditCat(null); flashCat("✅ Updated!"); loadCats(); }
    catch { flashCat("Failed", false); }
  };
  const toggleCat = async (cat) => {
    try { await API.put(`/support/admin/categories/${cat._id}`, { isVisible: !cat.isVisible }); flashCat(cat.isVisible ? "🔕 Hidden" : "✅ Shown"); loadCats(); }
    catch { flashCat("Failed", false); }
  };
  const deleteCat = async (id) => {
    if (!confirm("Delete?")) return;
    try { await API.delete(`/support/admin/categories/${id}`); flashCat("✅ Deleted"); loadCats(); }
    catch { flashCat("Failed", false); }
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const grouped = [];
  let lastDate = null;
  (activeTicket?.messages || []).forEach(m => {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) { grouped.push({ type: "date", label: fmtDate(m.createdAt) }); lastDate = d; }
    grouped.push({ type: "msg", msg: m });
  });

  const unreadForTicket = (t) => t.messages?.filter(m => m.sender === "user" && !m.seenByAdmin).length || 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-headset text-orange-500" /> Support Center
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage user support tickets</p>
          </div>
          {adminUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full animate-pulse shadow">
              {fmt(adminUnread)} new
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 shrink-0">
          {["tickets", "categories"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize ${tab === t ? "bg-orange-500 text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-orange-50"}`}>
              {t === "tickets" ? <><i className="fas fa-ticket mr-1.5" />Tickets</> : <><i className="fas fa-tags mr-1.5" />Categories</>}
            </button>
          ))}
        </div>

        {tab === "tickets" && (
          <div className="flex flex-1 gap-4 min-h-0">
            {/* Ticket list */}
            <div className="w-72 flex flex-col gap-3 shrink-0">
              <select value={filterStatus} onChange={e => setFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {ticketLoading ? (
                  <div className="flex justify-center py-10 text-orange-400"><i className="fas fa-spinner fa-spin text-2xl" /></div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No tickets found</div>
                ) : tickets.map(ticket => {
                  const u = unreadForTicket(ticket);
                  const meta = STATUS_META[ticket.status] || STATUS_META.open;
                  const isActive = activeTicket?._id === ticket._id;
                  return (
                    <div key={ticket._id} onClick={() => openTicket(ticket._id)}
                      className={`rounded-2xl p-3 cursor-pointer transition border ${isActive ? "border-orange-300 bg-orange-50 shadow-sm" : "border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">{ticket.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{ticket.user?.username} · {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                          {u > 0 && <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 animate-bounce">{u}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat pane */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
              {!activeTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <i className="fas fa-comments text-5xl mb-3" />
                  <p className="text-sm font-semibold">Select a ticket to view</p>
                </div>
              ) : chatLoading ? (
                <div className="flex-1 flex items-center justify-center text-orange-400"><i className="fas fa-spinner fa-spin text-2xl" /></div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{activeTicket.user?.username}</p>
                      <p className="text-orange-100 text-xs truncate">{activeTicket.title}</p>
                    </div>
                    <select value={activeTicket.status} onChange={e => changeStatus(e.target.value)}
                      className="text-xs font-bold bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                      <option value="open" className="text-gray-800">Open</option>
                      <option value="in_progress" className="text-gray-800">In Progress</option>
                      <option value="closed" className="text-gray-800">Closed</option>
                    </select>
                    <button onClick={() => deleteTicket(activeTicket._id)}
                      className="w-8 h-8 bg-white/20 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition">
                      <i className="fas fa-trash text-xs" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[#f0f2f5]">
                    {grouped.map((item, i) => {
                      if (item.type === "date") return (
                        <div key={i} className="flex justify-center my-3">
                          <span className="bg-white text-gray-400 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm border border-gray-100">{item.label}</span>
                        </div>
                      );
                      const m = item.msg;
                      const isAdmin = m.sender === "admin";
                      return (
                        <div key={m._id || i} className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-1`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isAdmin ? "bg-orange-500 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"}`}>
                            {m.file?.data && (
                              <div className="mb-2">
                                {m.file.mimeType?.startsWith("image/") ? (
                                  <img src={`data:${m.file.mimeType};base64,${m.file.data}`} alt={m.file.fileName}
                                    className="rounded-xl max-w-full max-h-40 object-cover cursor-pointer"
                                    onClick={() => window.open(`data:${m.file.mimeType};base64,${m.file.data}`)} />
                                ) : (
                                  <a href={`data:${m.file.mimeType};base64,${m.file.data}`} download={m.file.fileName}
                                    className={`flex items-center gap-2 text-xs font-semibold underline ${isAdmin ? "text-orange-100" : "text-orange-500"}`}>
                                    <i className="fas fa-file-arrow-down" /> {m.file.fileName}
                                  </a>
                                )}
                              </div>
                            )}
                            {m.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                            <p className={`text-[10px] mt-1 text-right ${isAdmin ? "text-orange-200" : "text-gray-400"}`}>
                              {fmtTime(m.createdAt)}
                              {isAdmin && <span className="ml-1">{m.seenByUser ? <i className="fas fa-check-double" /> : <i className="fas fa-check" />}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Reply file preview */}
                  {replyFilePrev && (
                    <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
                      {replyFilePrev.type.startsWith("image/") ? (
                        <img src={replyFilePrev.url} alt="preview" className="h-12 w-12 rounded-xl object-cover border border-gray-200" />
                      ) : (
                        <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100"><i className="fas fa-file text-orange-400" /></div>
                      )}
                      <p className="flex-1 text-xs text-gray-600 truncate">{replyFilePrev.name}</p>
                      <button onClick={() => { setReplyFile(null); setReplyFilePrev(null); }} className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center"><i className="fas fa-times text-xs" /></button>
                    </div>
                  )}

                  {/* Reply input */}
                  {activeTicket.status !== "closed" ? (
                    <div className="border-t border-gray-200 px-3 py-3 flex items-end gap-2 bg-white shrink-0">
                      <label className="w-9 h-9 bg-gray-100 hover:bg-orange-50 rounded-full flex items-center justify-center cursor-pointer transition shrink-0">
                        <i className="fas fa-paperclip text-gray-500 text-sm" />
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
                      </label>
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type a reply..." rows={1}
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm focus:outline-none resize-none max-h-24 overflow-y-auto" />
                      <button onClick={handleSend} disabled={sending || (!replyText.trim() && !replyFile)}
                        className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-full flex items-center justify-center text-white transition shrink-0">
                        {sending ? <i className="fas fa-spinner fa-spin text-xs" /> : <i className="fas fa-paper-plane text-xs" />}
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs text-gray-400 font-semibold shrink-0">
                      🔒 Ticket closed — change status above to reopen
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="max-w-xl space-y-4 overflow-y-auto flex-1">
            {catMsg.text && (
              <div className={`p-3 rounded-xl text-sm font-semibold text-center ${catMsg.ok ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{catMsg.text}</div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-500 mb-3">Add New Category</p>
              <div className="flex gap-2">
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Payment Issue"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  onKeyDown={e => e.key === "Enter" && createCat()} />
                <button onClick={createCat} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition"><i className="fas fa-plus" /></button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{catLoading ? "Loading..." : `${categories.length} Categories`}</p>
              {catLoading ? <div className="text-center py-8 text-orange-400"><i className="fas fa-spinner fa-spin text-2xl" /></div>
                : categories.length === 0 ? <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">No categories yet</div>
                : categories.map(cat => (
                  <div key={cat._id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${cat.isVisible ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"}`}>
                    {editCat === cat._id ? (
                      <>
                        <input value={editLabel} onChange={e => setEditLabel(e.target.value)} autoFocus
                          className="flex-1 border border-orange-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          onKeyDown={e => e.key === "Enter" && saveCat(cat._id)} />
                        <button onClick={() => saveCat(cat._id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center text-xs transition"><i className="fas fa-check" /></button>
                        <button onClick={() => setEditCat(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-xs transition"><i className="fas fa-times" /></button>
                      </>
                    ) : (
                      <>
                        <p className="flex-1 font-semibold text-sm text-gray-800">{cat.label}</p>
                        {!cat.isVisible && <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">HIDDEN</span>}
                        <button onClick={() => { setEditCat(cat._id); setEditLabel(cat.label); }} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center transition"><i className="fas fa-pen text-xs" /></button>
                        <button onClick={() => toggleCat(cat)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${cat.isVisible ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-500" : "bg-green-50 hover:bg-green-100 text-green-500"}`}><i className={`fas ${cat.isVisible ? "fa-eye-slash" : "fa-eye"} text-xs`} /></button>
                        <button onClick={() => deleteCat(cat._id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"><i className="fas fa-trash text-xs" /></button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
    }
