import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Header from "../components/Header";
import { useSupport } from "../context/SupportContext";

const STATUS = {
  open:        { label: "Open",        cls: "bg-blue-100 text-blue-600" },
  in_progress: { label: "In Progress", cls: "bg-orange-100 text-orange-600" },
  closed:      { label: "Closed",      cls: "bg-gray-100 text-gray-500" },
};

export default function SupportChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useSupport();

  const [ticket,   setTicket]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [file,     setFile]     = useState(null);
  const [filePrev, setFilePrev] = useState(null);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get(`/support/tickets/${id}`);
      setTicket(res.data);
      refreshUser();
    } catch { navigate("/support"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket?.messages?.length]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return alert("File must be under 5MB");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ data: ev.target.result.split(",")[1], mimeType: f.type, fileName: f.name });
      setFilePrev({ url: ev.target.result, name: f.name, type: f.type });
    };
    reader.readAsDataURL(f);
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      await API.post(`/support/tickets/${id}/reply`, { text: text.trim(), ...(file ? { file } : {}) });
      setText(""); setFile(null); setFilePrev(null);
      await load(true);
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    setSending(false);
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d) => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  // Group by date
  const grouped = [];
  let lastDate = null;
  (ticket?.messages || []).forEach(m => {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) { grouped.push({ type: "date", label: fmtDate(m.createdAt) }); lastDate = d; }
    grouped.push({ type: "msg", msg: m });
  });

  const isClosed = ticket?.status === "closed";
  const meta = STATUS[ticket?.status] || STATUS.open;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <i className="fas fa-spinner fa-spin text-orange-400 text-3xl" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5]">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 pt-3 pb-3 flex items-center gap-3 shadow-md shrink-0">
        <button onClick={() => navigate("/support")}
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
          <i className="fas fa-arrow-left text-sm" />
        </button>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <i className="fas fa-headset text-white text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{ticket?.title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {grouped.map((item, i) => {
          if (item.type === "date") return (
            <div key={i} className="flex justify-center my-3">
              <span className="bg-white text-gray-400 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm border border-gray-100">
                {item.label}
              </span>
            </div>
          );
          const m = item.msg;
          const isUser = m.sender === "user";
          return (
            <div key={m._id || i} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isUser ? "bg-orange-500 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"}`}>
                {m.file?.data && (
                  <div className="mb-2">
                    {m.file.mimeType?.startsWith("image/") ? (
                      <img src={`data:${m.file.mimeType};base64,${m.file.data}`} alt={m.file.fileName}
                        className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer"
                        onClick={() => window.open(`data:${m.file.mimeType};base64,${m.file.data}`)} />
                    ) : (
                      <a href={`data:${m.file.mimeType};base64,${m.file.data}`} download={m.file.fileName}
                        className={`flex items-center gap-2 text-xs font-semibold underline ${isUser ? "text-orange-100" : "text-orange-500"}`}>
                        <i className="fas fa-file-arrow-down" /> {m.file.fileName}
                      </a>
                    )}
                  </div>
                )}
                {m.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                <p className={`text-[10px] mt-1 text-right ${isUser ? "text-orange-200" : "text-gray-400"}`}>
                  {fmtTime(m.createdAt)}
                  {isUser && <span className="ml-1">{m.seenByAdmin ? <i className="fas fa-check-double" /> : <i className="fas fa-check" />}</span>}
                </p>
              </div>
            </div>
          );
        })}
        {isClosed && (
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full">🔒 This ticket is closed</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* File preview */}
      {filePrev && (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
          {filePrev.type.startsWith("image/") ? (
            <img src={filePrev.url} alt="preview" className="h-14 w-14 rounded-xl object-cover border border-gray-200" />
          ) : (
            <div className="h-14 w-14 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
              <i className="fas fa-file text-orange-400 text-xl" />
            </div>
          )}
          <p className="flex-1 text-xs text-gray-600 truncate">{filePrev.name}</p>
          <button onClick={() => { setFile(null); setFilePrev(null); }} className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
            <i className="fas fa-times text-xs" />
          </button>
        </div>
      )}

      {/* Input */}
      {!isClosed ? (
        <div className="bg-white border-t border-gray-200 px-3 py-3 flex items-end gap-2 shrink-0">
          <label className="w-10 h-10 bg-gray-100 hover:bg-orange-50 rounded-full flex items-center justify-center cursor-pointer transition shrink-0">
            <i className="fas fa-paperclip text-gray-500" />
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none resize-none max-h-28 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-full flex items-center justify-center text-white transition shrink-0 shadow"
          >
            {sending ? <i className="fas fa-spinner fa-spin text-sm" /> : <i className="fas fa-paper-plane text-sm" />}
          </button>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-400 font-semibold shrink-0">
          Ticket closed — <button onClick={() => navigate("/support")} className="text-orange-500 underline">Go back</button>
        </div>
      )}
    </div>
  );
}
