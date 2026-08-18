// src/templates/aurora/AuroraSupportChat.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import { useSupport } from "../../context/SupportContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { FiArrowLeft, FiHeadphones, FiPaperclip, FiSend, FiX, FiFile } from "react-icons/fi";

const STATUS = {
  open:        { color: "#60a5fa" },
  in_progress: { color: "#fbbf24" },
  closed:      { color: "#94a3b8" },
};

export default function AuroraSupportChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useSupport();
  const { childPanel } = useChildPanel();
  const brand = { color: childPanel?.themeColor || "#a78bfa" };

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
      <AuroraLayout>
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${brand.color} transparent transparent transparent` }} />
        </div>
      </AuroraLayout>
    );
  }

  return (
    <AuroraLayout>
      <div
        className="max-w-lg mx-auto rounded-2xl overflow-hidden flex flex-col"
        style={{ height: "76vh", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => navigate("/support")}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${brand.color}20`, color: brand.color }}>
            <FiArrowLeft size={14} />
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}20` }}>
            <FiHeadphones size={16} style={{ color: brand.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate text-white">{ticket?.title}</p>
            <span className="text-[10px] font-bold" style={{ color: meta.color }}>{ticket?.status}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {grouped.map((item, i) => {
            if (item.type === "date") return (
              <div key={i} className="flex justify-center my-3">
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                  {item.label}
                </span>
              </div>
            );
            const m = item.msg;
            const isUser = m.sender === "user";
            return (
              <div key={m._id || i} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5"
                  style={
                    isUser
                      ? { background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`, color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 }
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
                  <p className="text-[10px] mt-1 text-right" style={{ color: isUser ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
                    {fmtTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {isClosed && (
            <div className="flex justify-center my-4">
              <span className="text-xs font-semibold px-4 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>🔒 This ticket is closed</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {filePrev && (
          <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {filePrev.type.startsWith("image/") ? (
              <img src={filePrev.url} alt="preview" className="h-14 w-14 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
            ) : (
              <div className="h-14 w-14 rounded-xl flex items-center justify-center" style={{ background: `${brand.color}12`, border: `1px solid ${brand.color}30` }}>
                <FiFile size={18} style={{ color: brand.color }} />
              </div>
            )}
            <p className="flex-1 text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{filePrev.name}</p>
            <button onClick={() => { setFile(null); setFilePrev(null); }} className="w-7 h-7 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center flex-shrink-0">
              <FiX size={12} />
            </button>
          </div>
        )}

        {!isClosed ? (
          <div className="px-3 py-3 flex items-end gap-2 flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <label className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
              <FiPaperclip size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none max-h-28 overflow-y-auto"
              style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", outline: "none" }}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!text.trim() && !file)}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}bb)`, color: "#fff" }}
            >
              <FiSend size={14} />
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 text-center text-xs font-semibold flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            Ticket closed — <button onClick={() => navigate("/support")} className="underline" style={{ color: brand.color }}>Go back</button>
          </div>
        )}
      </div>
    </AuroraLayout>
  );
}
