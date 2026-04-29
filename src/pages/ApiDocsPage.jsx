// pages/ApiDocsPage.jsx
import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = "https://marinepanel.online/api/v2";

/* ================================
   Code Block
================================ */
const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#0f172a] rounded-lg overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre className="text-sm text-green-400 p-4 overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
};

/* ================================
   Param Table
================================ */
const ParamTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-700">
    <table className="w-full text-sm">
      <thead className="bg-gray-800 text-gray-300">
        <tr>
          <th className="px-4 py-2 text-left">Parameter</th>
          <th className="px-4 py-2 text-left">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([param, desc], i) => (
          <tr
            key={i}
            className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}
          >
            <td className="px-4 py-2 font-mono text-blue-400">{param}</td>
            <td className="px-4 py-2 text-gray-300">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ================================
   Section Accordion
================================ */
const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800 transition"
      >
        <span className="text-white font-semibold text-base">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-700 pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

/* ================================
   Badge
================================ */
const Badge = ({ label, color }) => {
  const colors = {
    POST: "bg-blue-600",
    GET: "bg-green-600",
  };

  return (
    <span
      className={`${colors[color] || "bg-gray-600"} text-white text-xs font-bold px-2 py-0.5 rounded`}
    >
      {label}
    </span>
  );
};

/* ================================
   Main Page
================================ */
const ApiDocsPage = () => {
  const { user } = useAuthContext(); // ✅ FIXED (no Redux)

  const [copied, setCopied] = useState(false);

  const apiKey = user?.apiKey || user?.api_key || null;

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col text-white">
      
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="flex-1 px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold mb-1">API Documentation</h1>
            <p className="text-gray-400 text-sm">
              Integrate Marine Panel into your own platform using our API.
            </p>
          </div>

          {/* API Info */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">HTTP Method</p>
                <Badge label="POST" color="POST" />
              </div>

              <div className="sm:col-span-2">
                <p className="text-gray-500 mb-1">API URL</p>
                <code className="text-blue-400 break-all">{API_URL}</code>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-1 text-sm">Response Format</p>
              <span className="text-gray-300 text-sm">JSON</span>
            </div>

            {/* API Key */}
            <div>
              <p className="text-gray-500 mb-1 text-sm">Your API Key</p>

              {apiKey ? (
                <div className="flex items-center gap-2">
                  <code className="bg-gray-800 px-3 py-1.5 rounded text-green-400 text-sm break-all flex-1">
                    {apiKey}
                  </code>

                  <button
                    onClick={handleCopyKey}
                    className="text-gray-400 hover:text-white transition shrink-0"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800 px-3 py-1.5 rounded text-gray-500 text-sm">
                  {user
                    ? "No API key yet — generate one in Settings."
                    : "Login to see your API key."}
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          <Section title="📦 Service List">
            <ParamTable rows={[["key", "Your API key"], ["action", "services"]]} />
            <CodeBlock
              code={JSON.stringify(
                [{ service: 1, name: "Followers", rate: "0.90" }],
                null,
                2
              )}
            />
          </Section>

          <Section title="➕ Add Order">
            <ParamTable
              rows={[
                ["key", "Your API key"],
                ["action", "add"],
                ["service", "Service ID"],
                ["link", "Link"],
                ["quantity", "Quantity"],
              ]}
            />
            <CodeBlock code={JSON.stringify({ order: 23501 }, null, 2)} />
          </Section>

          <Section title="📊 Order Status">
            <ParamTable
              rows={[
                ["key", "Your API key"],
                ["action", "status"],
                ["order", "Order ID"],
              ]}
            />
            <CodeBlock
              code={JSON.stringify(
                { status: "Processing", remains: "10" },
                null,
                2
              )}
            />
          </Section>

          <Section title="💰 Balance">
            <ParamTable rows={[["key", "Your API key"], ["action", "balance"]]} />
            <CodeBlock
              code={JSON.stringify(
                { balance: "100.84292", currency: "USD" },
                null,
                2
              )}
            />
          </Section>

          <p className="text-center text-gray-600 text-xs pb-6">
            Marine Panel API v2 · {API_URL}
          </p>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default ApiDocsPage;
