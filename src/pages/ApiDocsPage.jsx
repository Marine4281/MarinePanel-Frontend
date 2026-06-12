// pages/ApiDocsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, ChevronDown, ChevronUp, ArrowLeft, KeyRound } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

const MAIN_API_URL = "https://marinepanel.online/api/v2";

const CodeBlock = ({ code, accent }) => {
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
        className="absolute top-2 right-2 text-gray-400 hover:opacity-80 transition"
        style={{ color: copied ? accent : undefined }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre className="text-sm text-green-400 p-4 overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
};

const ParamTable = ({ rows, accent }) => (
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
            <td className="px-4 py-2 font-mono" style={{ color: accent }}>{param}</td>
            <td className="px-4 py-2 text-gray-300">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ title, children, accent }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800 transition"
      >
        <span className="text-white font-semibold text-base">{title}</span>
        {open ? (
          <ChevronUp size={18} style={{ color: accent }} />
        ) : (
          <ChevronDown size={18} style={{ color: accent }} />
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

const Badge = ({ label, accent }) => {
  const bg = label === "POST" ? accent : "#16a34a"; // GET stays green
  return (
    <span
      className="text-white text-xs font-bold px-2 py-0.5 rounded"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
};

const ApiDocsPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  // Resolve brand name, accent color, and API domain based on domain type
  const brand =
    domainType === "childPanel" && childPanel
      ? {
          name: childPanel.brandName || "Panel",
          color: childPanel.themeColor || "#f97316",
          domain: childPanel.domain || "marinepanel.online",
        }
      : domainType === "reseller" && reseller
      ? {
          name: reseller.brandName || "Panel",
          color: reseller.themeColor || "#f97316",
          domain: reseller.domain || "marinepanel.online",
        }
      : { name: "MarinePanel", color: "#f97316", domain: "marinepanel.online" };

  const apiUrl =
    domainType === "main" ? MAIN_API_URL : `https://${brand.domain}/api/v2`;

  const accent = brand.color;

  // Update page title to match brand
  useEffect(() => {
    document.title = `API Documentation — ${brand.name}`;
    return () => { document.title = brand.name; };
  }, [brand.name]);

  const apiKey = user?.apiKey || null;

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:opacity-80 transition text-sm"
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold mb-1">API Documentation</h1>
          <p className="text-gray-400 text-sm">
            Integrate {brand.name} into your own platform using our API.
          </p>
        </div>

        {/* ── API Info Card ── */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">HTTP Method</p>
              <Badge label="POST" accent={accent} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 mb-1">API URL</p>
              <code className="break-all" style={{ color: accent }}>{apiUrl}</code>
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
                <code className="bg-gray-800 px-3 py-1.5 rounded text-sm break-all flex-1" style={{ color: accent }}>
                  {apiKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="text-gray-400 hover:opacity-80 transition shrink-0"
                  style={{ color: copied ? accent : undefined }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 px-3 py-3 rounded text-sm flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-gray-400">
                  {user
                    ? "You don't have an API key yet."
                    : "Login to see your API key."}
                </span>
                {user && (
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-1.5 font-medium shrink-0 hover:opacity-80 transition"
                    style={{ color: accent }}
                  >
                    <KeyRound size={14} />
                    Generate one in your Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Service List ── */}
        <Section title="📦 Service List" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "services"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              [
                {
                  service: 1,
                  name: "Followers",
                  type: "Default",
                  category: "Instagram - Followers",
                  rate: "0.90",
                  min: "50",
                  max: "10000",
                  refill: true,
                  cancel: true,
                },
              ],
              null,
              2
            )}
          />
        </Section>

        {/* ── Add Order ── */}
        <Section title="➕ Add Order" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "add"],
              ["service", "Service ID"],
              ["link", "Link to page"],
              ["quantity", "Needed quantity"],
            ]}
          />
          <CodeBlock accent={accent} code={JSON.stringify({ order: 23501 }, null, 2)} />
        </Section>

        {/* ── Order Status ── */}
        <Section title="📊 Order Status" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "status"],
              ["order", "Order ID"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              {
                charge: "0.27819",
                start_count: "0",
                status: "In progress",
                remains: "157",
                currency: "USD",
              },
              null,
              2
            )}
          />
        </Section>

        {/* ── Multiple Orders Status ── */}
        <Section title="📊 Multiple Orders Status" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "status"],
              ["orders", "Order IDs separated by comma (up to 100)"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              {
                1: {
                  charge: "0.27819",
                  start_count: "0",
                  status: "Partial",
                  remains: "157",
                  currency: "USD",
                },
                10: { error: "Incorrect order ID" },
                100: {
                  charge: "1.44219",
                  start_count: "0",
                  status: "In progress",
                  remains: "10",
                  currency: "USD",
                },
              },
              null,
              2
            )}
          />
        </Section>

        {/* ── Create Refill ── */}
        <Section title="🔄 Create Refill" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "refill"],
              ["order", "Order ID"],
            ]}
          />
          <CodeBlock accent={accent} code={JSON.stringify({ refill: "1" }, null, 2)} />
        </Section>

        {/* ── Multiple Refill ── */}
        <Section title="🔄 Create Multiple Refill" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "refill"],
              ["orders", "Order IDs separated by comma (up to 100)"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              [
                { order: 1, refill: 1 },
                { order: 2, refill: 2 },
                { order: 3, refill: { error: "Incorrect order ID" } },
              ],
              null,
              2
            )}
          />
        </Section>

        {/* ── Refill Status ── */}
        <Section title="📋 Get Refill Status" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "refill_status"],
              ["refill", "Refill ID"],
            ]}
          />
          <CodeBlock accent={accent} code={JSON.stringify({ status: "Completed" }, null, 2)} />
        </Section>

        {/* ── Multiple Refill Status ── */}
        <Section title="📋 Get Multiple Refill Status" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "refill_status"],
              ["refills", "Refill IDs separated by comma (up to 100)"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              [
                { refill: 1, status: "Completed" },
                { refill: 2, status: "Rejected" },
                { refill: 3, status: { error: "Refill not found" } },
              ],
              null,
              2
            )}
          />
        </Section>

        {/* ── Cancel ── */}
        <Section title="❌ Cancel Orders" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "cancel"],
              ["orders", "Order IDs separated by comma (up to 100)"],
            ]}
          />
          <CodeBlock
            accent={accent}
            code={JSON.stringify(
              [
                { order: 9, cancel: { error: "Incorrect order ID" } },
                { order: 2, cancel: 1 },
              ],
              null,
              2
            )}
          />
        </Section>

        {/* ── Balance ── */}
        <Section title="💰 User Balance" accent={accent}>
          <ParamTable
            accent={accent}
            rows={[
              ["key", "Your API key"],
              ["action", "balance"],
            ]}
          />
          <CodeBlock accent={accent} code={JSON.stringify({ balance: "100.84292", currency: "USD" }, null, 2)} />
        </Section>

        {/* ── Footer ── */}
        <p className="text-center text-gray-600 text-xs pb-6">
          {brand.name} API v2 · {apiUrl}
        </p>
      </div>
    </div>
  );
};

export default ApiDocsPage;
