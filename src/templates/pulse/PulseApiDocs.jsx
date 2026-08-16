// src/templates/pulse/PulseApiDocs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import PulseLayout from "./PulseLayout";
import API from "../../api/axios";
import {
  FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiKey,
  FiPackage, FiPlusCircle, FiBarChart2, FiRefreshCw,
  FiList, FiXCircle, FiDollarSign,
} from "react-icons/fi";

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-50">
      <button onClick={copy} className="absolute top-2 right-2 text-gray-400">
        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      </button>
      <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap font-mono text-gray-700">{code}</pre>
    </div>
  );
};

const ParamTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-100">
    <table className="w-full text-xs">
      <thead className="bg-gray-50 text-gray-400">
        <tr>
          <th className="px-4 py-2 text-left font-bold uppercase">Parameter</th>
          <th className="px-4 py-2 text-left font-bold uppercase">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([param, desc], i) => (
          <tr key={i} className="border-t border-gray-50">
            <td className="px-4 py-2 font-mono font-semibold text-gray-800">{param}</td>
            <td className="px-4 py-2 text-gray-400">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ title, blurb, icon: Icon, brand, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen((p) => !p)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${brand.color}12`, color: brand.color }}>
            <Icon size={14} />
          </div>
          <div className="min-w-0">
            <span className="font-black text-sm block text-gray-900">{title}</span>
            {blurb && <p className="text-xs text-gray-400 mt-0.5">{blurb}</p>}
          </div>
        </div>
        {open ? <FiChevronUp size={15} className="text-gray-400 flex-shrink-0" /> : <FiChevronDown size={15} className="text-gray-300 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 pt-1 border-t border-gray-50">{children}</div>}
    </div>
  );
};

const Badge = ({ label }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white ${label === "POST" ? "bg-indigo-500" : "bg-green-600"}`}>
    {label}
  </span>
);

export default function PulseApiDocs() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = { color: childPanel?.themeColor || "#6366f1", name: childPanel?.brandName || "Panel" };
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
    <PulseLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="pt-1">
          <p className="text-xs text-gray-400 font-semibold">Docs</p>
          <h2 className="text-xl font-black text-gray-900">API Documentation</h2>
          <p className="text-xs text-gray-400 mt-1">Plug {brand.name} into your own app.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="mb-1 font-semibold text-gray-400 uppercase">Method</p>
              <Badge label="POST" />
            </div>
            <div>
              <p className="mb-1 font-semibold text-gray-400 uppercase">Format</p>
              <span className="text-gray-800 font-semibold">JSON</span>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-400 uppercase">API URL</p>
            <code className="break-all text-sm font-semibold" style={{ color: brand.color }}>{apiUrl}</code>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
              <FiKey size={12} /> Your API Key
            </p>
            {loading ? (
              <div className="h-9 rounded-xl bg-gray-50 animate-pulse" />
            ) : apiKey ? (
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-xl text-xs break-all flex-1 font-mono bg-gray-50 text-gray-800">{apiKey}</code>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? "#16a34a" : "#9ca3af" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 rounded-xl text-xs flex flex-col gap-2 bg-gray-50 border border-dashed border-gray-200">
                <span className="text-gray-400">You don't have an API key yet.</span>
                <button onClick={() => navigate("/profile")} className="flex items-center gap-1.5 font-bold" style={{ color: brand.color }}>
                  <FiKey size={12} /> Generate one in your Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <Section title="Service List" blurb="Every service with live pricing and limits." icon={FiPackage} brand={brand} defaultOpen>
          <ParamTable rows={[["key", "Your API key"], ["action", "services"]]} />
          <CodeBlock code={JSON.stringify([{ service: 1, name: "Followers", rate: "0.90", min: "50", max: "10000" }], null, 2)} />
        </Section>

        <Section title="Add Order" blurb="Places a new order." icon={FiPlusCircle} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "add"], ["service", "Service ID"], ["link", "Link"], ["quantity", "Quantity"]]} />
          <CodeBlock code={JSON.stringify({ order: 23501 }, null, 2)} />
        </Section>

        <Section title="Order Status" blurb="Check where an order stands." icon={FiBarChart2} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "status"], ["order", "Order ID"]]} />
          <CodeBlock code={JSON.stringify({ charge: "0.278", status: "In progress", remains: "157" }, null, 2)} />
        </Section>

        <Section title="Create Refill" blurb="Requests a refill on a delivered order." icon={FiRefreshCw} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "refill"], ["order", "Order ID"]]} />
          <CodeBlock code={JSON.stringify({ refill: "1" }, null, 2)} />
        </Section>

        <Section title="Refill Status" blurb="Check a refill request." icon={FiList} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "refill_status"], ["refill", "Refill ID"]]} />
          <CodeBlock code={JSON.stringify({ status: "Completed" }, null, 2)} />
        </Section>

        <Section title="Cancel Orders" blurb="Cancels unfinished orders where allowed." icon={FiXCircle} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "cancel"], ["orders", "Order IDs, comma-separated"]]} />
          <CodeBlock code={JSON.stringify([{ order: 2, cancel: 1 }], null, 2)} />
        </Section>

        <Section title="User Balance" blurb="Returns your current balance." icon={FiDollarSign} brand={brand}>
          <ParamTable rows={[["key", "Your API key"], ["action", "balance"]]} />
          <CodeBlock code={JSON.stringify({ balance: "100.84", currency: "USD" }, null, 2)} />
        </Section>

        <p className="text-center text-xs text-gray-300 pb-2">{brand.name} API v2 · {apiUrl}</p>
      </div>
    </PulseLayout>
  );
}
