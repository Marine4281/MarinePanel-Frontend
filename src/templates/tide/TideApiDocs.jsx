// src/templates/tide/TideApiDocs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import TideLayout from "./TideLayout";
import API from "../../api/axios";
import {
  FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiKey,
  FiPackage, FiPlusCircle, FiBarChart2, FiRefreshCw,
  FiList, FiXCircle, FiDollarSign,
} from "react-icons/fi";

const CodeBlock = ({ code, accent }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-slate-400 hover:text-white transition"
        style={{ color: copied ? accent : undefined }}
      >
        {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
      </button>
      <pre className="text-xs text-slate-200 p-4 overflow-x-auto whitespace-pre-wrap font-mono">{code}</pre>
    </div>
  );
};

const ParamTable = ({ rows, accent }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100">
    <table className="w-full text-xs">
      <thead className="bg-gray-50 text-gray-400">
        <tr>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Parameter</th>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Description</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map(([param, desc], i) => (
          <tr key={i}>
            <td className="px-4 py-2 font-mono font-semibold" style={{ color: accent }}>{param}</td>
            <td className="px-4 py-2 text-gray-500">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ title, blurb, icon: Icon, accent, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}14`, color: accent }}>
            <Icon size={15} />
          </div>
          <div className="min-w-0">
            <span className="font-black text-sm text-gray-900 block">{title}</span>
            {blurb && <p className="text-xs text-gray-400 mt-0.5">{blurb}</p>}
          </div>
        </div>
        {open ? <FiChevronUp size={16} className="text-gray-300 flex-shrink-0" style={{ color: accent }} /> : <FiChevronDown size={16} className="text-gray-300 flex-shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">{children}</div>}
    </div>
  );
};

const Badge = ({ label, accent }) => (
  <span className="text-white text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: label === "POST" ? accent : "#16a34a" }}>
    {label}
  </span>
);

export default function TideApiDocs() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = { color: childPanel?.themeColor || "#0ea5e9", name: childPanel?.brandName || "Panel" };
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
    <TideLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-black text-gray-900">API Documentation</h2>
          <p className="text-xs text-gray-400 mt-1">
            Plug {brand.name} into your own app — send orders, check on them, and manage refills.
          </p>
        </div>

        {/* API info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1 font-semibold uppercase tracking-wide">HTTP Method</p>
              <Badge label="POST" accent={brand.color} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-400 mb-1 font-semibold uppercase tracking-wide">API URL</p>
              <code className="break-all text-sm font-semibold" style={{ color: brand.color }}>{apiUrl}</code>
            </div>
          </div>

          <div>
            <p className="text-gray-400 mb-1 text-xs font-semibold uppercase tracking-wide">Response Format</p>
            <span className="text-gray-700 text-sm">JSON</span>
          </div>

          <div>
            <p className="text-gray-400 mb-1 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <FiKey size={12} /> Your API Key
            </p>
            <p className="text-gray-400 text-xs mb-2">
              Send this with every request. Keep it private — anyone with this key can place orders on your balance.
            </p>
            {loading ? (
              <div className="h-9 bg-gray-50 rounded-lg animate-pulse" />
            ) : apiKey ? (
              <div className="flex items-center gap-2">
                <code className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-xs break-all flex-1 font-mono" style={{ color: brand.color }}>
                  {apiKey}
                </code>
                <button onClick={handleCopyKey} className="text-gray-400 hover:text-gray-600 flex-shrink-0" style={copied ? { color: brand.color } : {}}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 px-3 py-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-gray-500">You don't have an API key yet.</span>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-1.5 font-bold shrink-0"
                  style={{ color: brand.color }}
                >
                  <FiKey size={12} /> Generate one in your Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <Section title="Service List" blurb="Pulls every service you can order, with current pricing and limits." icon={FiPackage} accent={brand.color} defaultOpen>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "services"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify([{ service: 1, name: "Followers", type: "Default", category: "Instagram - Followers", rate: "0.90", min: "50", max: "10000", refill: true, cancel: true }], null, 2)} />
        </Section>

        <Section title="Add Order" blurb="Places a new order. Returns the order ID you'll use to check status later." icon={FiPlusCircle} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "add"], ["service", "Service ID"], ["link", "Link to page"], ["quantity", "Needed quantity"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ order: 23501 }, null, 2)} />
        </Section>

        <Section title="Order Status" blurb="Check where one order stands — delivered vs. remaining." icon={FiBarChart2} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "status"], ["order", "Order ID"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ charge: "0.27819", start_count: "0", status: "In progress", remains: "157", currency: "USD" }, null, 2)} />
        </Section>

        <Section title="Multiple Orders Status" blurb="Same as above, batched — up to 100 order IDs per call." icon={FiBarChart2} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "status"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ 1: { charge: "0.27819", start_count: "0", status: "Partial", remains: "157", currency: "USD" }, 10: { error: "Incorrect order ID" } }, null, 2)} />
        </Section>

        <Section title="Create Refill" blurb="Requests a refill on an order that dropped after delivery, if supported." icon={FiRefreshCw} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "refill"], ["order", "Order ID"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ refill: "1" }, null, 2)} />
        </Section>

        <Section title="Create Multiple Refill" blurb="Requests refills on several orders at once." icon={FiRefreshCw} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "refill"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify([{ order: 1, refill: 1 }, { order: 2, refill: 2 }], null, 2)} />
        </Section>

        <Section title="Get Refill Status" blurb="Check whether a refill was approved, rejected, or is pending." icon={FiList} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "refill_status"], ["refill", "Refill ID"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ status: "Completed" }, null, 2)} />
        </Section>

        <Section title="Cancel Orders" blurb="Cancels orders that haven't finished, where the service allows it." icon={FiXCircle} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "cancel"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify([{ order: 9, cancel: { error: "Incorrect order ID" } }, { order: 2, cancel: 1 }], null, 2)} />
        </Section>

        <Section title="User Balance" blurb="Returns your current account balance." icon={FiDollarSign} accent={brand.color}>
          <ParamTable accent={brand.color} rows={[["key", "Your API key"], ["action", "balance"]]} />
          <CodeBlock accent={brand.color} code={JSON.stringify({ balance: "100.84292", currency: "USD" }, null, 2)} />
        </Section>

        <p className="text-center text-gray-300 text-xs pb-4">{brand.name} API v2 · {apiUrl}</p>
      </div>
    </TideLayout>
  );
}
