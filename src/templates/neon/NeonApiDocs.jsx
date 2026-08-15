// src/templates/neon/NeonApiDocs.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";
import API from "../../api/axios";
import {
  FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiKey,
  FiPackage, FiPlusCircle, FiBarChart2, FiRefreshCw,
  FiList, FiXCircle, FiDollarSign,
} from "react-icons/fi";

const CodeBlock = ({ code, neon }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#0d0d16" }}>
      <button
        onClick={copy}
        className="absolute top-2 right-2 transition"
        style={{ color: copied ? neon : "#5c5c82" }}
      >
        {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
      </button>
      <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap font-mono" style={{ color: "#c4c4e0" }}>{code}</pre>
    </div>
  );
};

const ParamTable = ({ rows, neon }) => (
  <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${neon}18` }}>
    <table className="w-full text-xs">
      <thead style={{ background: "#141420", color: "#5c5c82" }}>
        <tr>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Parameter</th>
          <th className="px-4 py-2 text-left font-bold uppercase tracking-wide">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([param, desc], i) => (
          <tr key={i} style={{ borderTop: `1px solid ${neon}10` }}>
            <td className="px-4 py-2 font-mono font-semibold" style={{ color: neon }}>{param}</td>
            <td className="px-4 py-2" style={{ color: "#8888a8" }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ title, blurb, icon: Icon, neon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${neon}14`, color: neon }}>
            <Icon size={15} />
          </div>
          <div className="min-w-0">
            <span className="font-black text-sm block" style={{ color: "#c4c4e0" }}>{title}</span>
            {blurb && <p className="text-xs mt-0.5" style={{ color: "#6c6c92" }}>{blurb}</p>}
          </div>
        </div>
        {open ? <FiChevronUp size={16} style={{ color: neon }} /> : <FiChevronDown size={16} style={{ color: "#5c5c82" }} />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 pt-2" style={{ borderTop: `1px solid ${neon}0f` }}>{children}</div>}
    </div>
  );
};

const Badge = ({ label, neon }) => (
  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: label === "POST" ? neon : "#16a34a", color: "#0a0a14" }}>
    {label}
  </span>
);

export default function NeonApiDocs() {
  const { childPanel } = useChildPanel();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = { color: childPanel?.themeColor || "#00ff88", name: childPanel?.brandName || "Panel" };
  const neon = brand.color;
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
    <NeonLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Docs</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>
            API Documentation
          </h2>
          <p className="text-xs mt-1" style={{ color: "#6c6c92" }}>
            Plug {brand.name} into your own app — send orders, check on them, and manage refills.
          </p>
        </div>

        {/* API info card */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "#1b1b2a", border: `1px solid ${neon}18` }}>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: "#5c5c82" }}>HTTP Method</p>
              <Badge label="POST" neon={neon} />
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: "#5c5c82" }}>API URL</p>
              <code className="break-all text-sm font-semibold" style={{ color: neon }}>{apiUrl}</code>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5c5c82" }}>Response Format</p>
            <span className="text-sm" style={{ color: "#c4c4e0" }}>JSON</span>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "#5c5c82" }}>
              <FiKey size={12} /> Your API Key
            </p>
            <p className="text-xs mb-2" style={{ color: "#6c6c92" }}>
              Send this with every request. Keep it private — anyone with this key can place orders on your balance.
            </p>
            {loading ? (
              <div className="h-9 rounded-lg animate-pulse" style={{ background: "#141420" }} />
            ) : apiKey ? (
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg text-xs break-all flex-1 font-mono" style={{ background: "#141420", border: `1px solid ${neon}18`, color: neon }}>
                  {apiKey}
                </code>
                <button onClick={handleCopyKey} className="flex-shrink-0" style={{ color: copied ? neon : "#5c5c82" }}>
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center gap-2" style={{ background: "#141420", border: `1px dashed ${neon}22` }}>
                <span style={{ color: "#8888a8" }}>You don't have an API key yet.</span>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-1.5 font-bold shrink-0"
                  style={{ color: neon }}
                >
                  <FiKey size={12} /> Generate one in your Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <Section title="Service List" blurb="Pulls every service you can order, with current pricing and limits." icon={FiPackage} neon={neon} defaultOpen>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "services"]]} />
          <CodeBlock neon={neon} code={JSON.stringify([{ service: 1, name: "Followers", type: "Default", category: "Instagram - Followers", rate: "0.90", min: "50", max: "10000", refill: true, cancel: true }], null, 2)} />
        </Section>

        <Section title="Add Order" blurb="Places a new order. Returns the order ID you'll use to check status later." icon={FiPlusCircle} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "add"], ["service", "Service ID"], ["link", "Link to page"], ["quantity", "Needed quantity"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ order: 23501 }, null, 2)} />
        </Section>

        <Section title="Order Status" blurb="Check where one order stands — delivered vs. remaining." icon={FiBarChart2} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "status"], ["order", "Order ID"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ charge: "0.27819", start_count: "0", status: "In progress", remains: "157", currency: "USD" }, null, 2)} />
        </Section>

        <Section title="Multiple Orders Status" blurb="Same as above, batched — up to 100 order IDs per call." icon={FiBarChart2} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "status"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ 1: { charge: "0.27819", start_count: "0", status: "Partial", remains: "157", currency: "USD" }, 10: { error: "Incorrect order ID" } }, null, 2)} />
        </Section>

        <Section title="Create Refill" blurb="Requests a refill on an order that dropped after delivery, if supported." icon={FiRefreshCw} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "refill"], ["order", "Order ID"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ refill: "1" }, null, 2)} />
        </Section>

        <Section title="Create Multiple Refill" blurb="Requests refills on several orders at once." icon={FiRefreshCw} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "refill"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock neon={neon} code={JSON.stringify([{ order: 1, refill: 1 }, { order: 2, refill: 2 }], null, 2)} />
        </Section>

        <Section title="Get Refill Status" blurb="Check whether a refill was approved, rejected, or is pending." icon={FiList} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "refill_status"], ["refill", "Refill ID"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ status: "Completed" }, null, 2)} />
        </Section>

        <Section title="Cancel Orders" blurb="Cancels orders that haven't finished, where the service allows it." icon={FiXCircle} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "cancel"], ["orders", "Order IDs separated by comma (up to 100)"]]} />
          <CodeBlock neon={neon} code={JSON.stringify([{ order: 9, cancel: { error: "Incorrect order ID" } }, { order: 2, cancel: 1 }], null, 2)} />
        </Section>

        <Section title="User Balance" blurb="Returns your current account balance." icon={FiDollarSign} neon={neon}>
          <ParamTable neon={neon} rows={[["key", "Your API key"], ["action", "balance"]]} />
          <CodeBlock neon={neon} code={JSON.stringify({ balance: "100.84292", currency: "USD" }, null, 2)} />
        </Section>

        <p className="text-center text-xs pb-4" style={{ color: "#4a4a6a" }}>{brand.name} API v2 · {apiUrl}</p>
      </div>
    </NeonLayout>
  );
               }
