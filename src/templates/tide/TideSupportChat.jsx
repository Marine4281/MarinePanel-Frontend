// src/templates/tide/TideSupportChat.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import { useSupport } from "../../context/SupportContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiArrowLeft, FiHeadphones, FiPaperclip, FiSend, FiX, FiFile } from "react-icons/fi";

const STATUS = {
  open:        { label: "Open",        bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  in_progress: { label: "In Progress", bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  closed:      { label: "Closed",      bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
};

export default function TideSupportChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useSupport();
  const { childPanel } = useChildPanel();

  const brand = { color: childPanel?.themeColor || "#0ea5e9" };

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

  const grouped = [];
  let lastDate = null;
  (ticket?.messages || []).forEach(m => {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) { grouped.push({ type: "date", label: fmtDate(m.createdAt) }); lastDate = d; }
    grouped.push({ type: "msg", msg: m });
  });

  const isClosed = ticket?.status === "closed";
  const meta = STATUS[ticket?.status] || STATUS.open;

  if (loading) {
    return (
      <TideLayout>
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </TideLayout>
    );
  }

  return (
    <TideLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: "78vh" }}>

        {/* Chat header */}
        <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: brand.color }}>
          <button onClick={() => navigate("/support")}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition">
            <FiArrowLeft size={14} />
          </button>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <FiHeadphones size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{ticket?.title}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ background: "#f7fafc" }}>
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
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm"
                  style={
                    isUser
                      ? { background: brand.color, color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "#1f2937", border: "1px solid #f3f4f6", borderBottomLeftRadius: 4 }
                  }
                >
                  {m.file?.data && (
                    <div className="mb-2">
                      {m.file.mimeType?.startsWith("image/") ? (
                        <img src={`data:${m.file.mimeType};base64,${m.file.data}`} alt={m.file.fileName}
                          className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer"
                          onClick={() => window.open(`data:${m.file.mimeType};base64,${m.file.data}`)} />
                      ) : (
                        <a href={`data:${m.file.mimeType};base64,${m.file.data}`} download={m.file.fileName}
                          className="flex items-center gap-2 text-xs font-semibold underline"
                          style={{ color: isUser ? "#fff" : brand.color }}>
                          <FiFile size={12} /> {m.file.fileName}
                        </a>
                      )}
                    </div>
                  )}
                  {m.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                  <p className="text-[10px] mt-1 text-right" style={{ color: isUser ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                    {fmtTime(m.createdAt)}
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
          <div className="bg-white border-t border-gray-100 px-4 py-2 flex items-center gap-3 shrink-0">
            {filePrev.type.startsWith("image/") ? (
              <img src={filePrev.url} alt="preview" className="h-14 w-14 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="h-14 w-14 rounded-xl flex items-center justify-center border" style={{ background: `${brand.color}0d`, borderColor: `${brand.color}33` }}>
                <FiFile size={18} style={{ color: brand.color }} />
              </div>
            )}
            <p className="flex-1 text-xs text-gray-600 truncate">{filePrev.name}</p>
            <button onClick={() => { setFile(null); setFilePrev(null); }} className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
              <FiX size={12} />
            </button>
          </div>
        )}

        {/* Input */}
        {!isClosed ? (
          <div className="bg-white border-t border-gray-100 px-3 py-3 flex items-end gap-2 shrink-0">
            <label className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer transition shrink-0">
              <FiPaperclip size={16} className="text-gray-500" />
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition shrink-0 disabled:opacity-40"
              style={{ background: brand.color }}
            >
              <FiSend size={14} />
            </button>
          </div>
        ) : (
          <div className="bg-white border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400 font-semibold shrink-0">
            Ticket closed — <button onClick={() => navigate("/support")} className="underline" style={{ color: brand.color }}>Go back</button>
          </div>
        )}
      </div>
    </TideLayout>
  );
        }
