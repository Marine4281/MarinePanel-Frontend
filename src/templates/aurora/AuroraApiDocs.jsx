// src/templates/aurora/AuroraApiDocs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";
import API from "../../api/axios";
import {
  FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiKey,
  FiPackage, FiPlusCircle, FiBarChart2, FiRefreshCw,
  FiList, FiXCircle, FiDollarSign,
} from "react-icons/fi";

const CodeBlock = ({ code, brand }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.25)" }}>
      <button onClick={copy} className="absolute top-2 right-2" style={{ color: copied ? brand.color : "rgba(255,255,255,0.35)" }}>
        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      </button>
      <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap font-mono" style={{ color: "#e2e8f0" }}>{code}</pre>
    </div>
  );
};

const ParamTable = ({ rows, brand }) => (
  <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
    <table className="w-full text-xs">
      <thead style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
        <tr>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Parameter</th>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([param, desc], i) => (
          <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <td className="px-4 py-2 font-mono font-semibold" style={{ color: brand.color }}>{param}</td>
            <td className="px-4 py-2" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ title, blurb, icon: Icon, brand, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen((p) => !p)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}20`, color: brand.color }}>
            <Icon size={15} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm block text-white">{title}</span>
            {blurb && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{blurb}</p>}
          </div>
        </div>
        {open ? <FiChevronUp size={16} style={{ color: brand.color }} /> : <FiChevronDown size={16} style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>{children}</div>}
    </div>
  );
};

const Badge = ({ label }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white ${label === "POST" ? "bg-violet-500" : "bg-green-600"}`}>
    {label}
  </span>
);

export default function AuroraApiDocs() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = { color: childPanel?.themeColor || "#a78bfa", name: childPanel?.brandName || "Panel" };
  const apiUrl = `https://${childPanel?.domain || "marinepanel.online"}/api/v2`;

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => setApiKey(r.data?.apiKey || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: brand.color }}>Docs</p>
          <h2 className="text-2xl font-black text-white">API Documentation</h2>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Plug {brand.name} into your own app.
          </p>
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Method</p>
              <Badge label="POST" />
            </div>
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Format</p>
              <span className="text-white font-semibold">JSON</span>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>API URL</p>
            <code className="break-all text-sm font-semibold" style={{ color: brand.color }}>{apiUrl}</code>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              <FiKey size={12} /> Your API Key
            </p>
            {loading ? (
              <div className="h-9 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ) : apiKey ? (
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg text-xs break-all flex-1 font-mono" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: brand.color }}>
                  {apiKey}
                </code>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? brand.color : "rgba(255,255,255,0.35)" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 rounded-lg text-xs flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)" }}>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>You don't have an API key yet.</span>
                <button onClick={() => navigate("/profile")} className="flex items-center gap-1.5 font-bold" style={{ color: brand.color }}>
                  <FiKey size={12} /> Generate one in your Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <Section title="Service List" blurb="Every service with live pricing and limits." icon={FiPackage} brand={brand} defaultOpen>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "services"]]} />
          <CodeBlock brand={brand} code={JSON.stringify([{ service: 1, name: "Followers", rate: "0.90", min: "50", max: "10000" }], null, 2)} />
        </Section>

        <Section title="Add Order" blurb="Places a new order." icon={FiPlusCircle} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "add"], ["service", "Service ID"], ["link", "Link"], ["quantity", "Quantity"]]} />
          <CodeBlock brand={brand} code={JSON.stringify({ order: 23501 }, null, 2)} />
        </Section>

        <Section title="Order Status" blurb="Check where an order stands." icon={FiBarChart2} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "status"], ["order", "Order ID"]]} />
          <CodeBlock brand={brand} code={JSON.stringify({ charge: "0.278", status: "In progress", remains: "157" }, null, 2)} />
        </Section>

        <Section title="Create Refill" blurb="Requests a refill on a delivered order." icon={FiRefreshCw} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "refill"], ["order", "Order ID"]]} />
          <CodeBlock brand={brand} code={JSON.stringify({ refill: "1" }, null, 2)} />
        </Section>

        <Section title="Refill Status" blurb="Check a refill request." icon={FiList} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "refill_status"], ["refill", "Refill ID"]]} />
          <CodeBlock brand={brand} code={JSON.stringify({ status: "Completed" }, null, 2)} />
        </Section>

        <Section title="Cancel Orders" blurb="Cancels unfinished orders where allowed." icon={FiXCircle} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "cancel"], ["orders", "Order IDs, comma-separated"]]} />
          <CodeBlock brand={brand} code={JSON.stringify([{ order: 2, cancel: 1 }], null, 2)} />
        </Section>

        <Section title="User Balance" blurb="Returns your current balance." icon={FiDollarSign} brand={brand}>
          <ParamTable brand={brand} rows={[["key", "Your API key"], ["action", "balance"]]} />
          <CodeBlock brand={brand} code={JSON.stringify({ balance: "100.84", currency: "USD" }, null, 2)} />
        </Section>

        <p className="text-center text-xs pb-4" style={{ color: "rgba(255,255,255,0.25)" }}>{brand.name} API v2 · {apiUrl}</p>
      </div>
    </AuroraLayout>
  );
    }
