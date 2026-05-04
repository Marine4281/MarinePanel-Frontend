// src/pages/childpanel/ChildPanelSettings.jsx
//
// All child panel owner settings in one tabbed page.
// Tabs: Branding | Support | Domain | Fees | Gateway | Templates
// Hits /cp/settings/* endpoints exclusively.

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import { useAuth } from "../../context/AuthContext";
import { useChildPanel } from "../../context/ChildPanelContext";
import { getAllTemplates } from "../../templates/registry";
import {
  FiGlobe,
  FiZap,
  FiDollarSign,
  FiCreditCard,
  FiMessageCircle,
  FiImage,
  FiSave,
  FiLayout,
  FiCheck,
  FiMonitor,
  FiSmartphone,
  FiMenu,
  FiArrowRight,
} from "react-icons/fi";

// ======================= TABS =======================

const TABS = [
  { key: "branding",  label: "Branding",  icon: <FiImage size={14} /> },
  { key: "support",   label: "Support",   icon: <FiMessageCircle size={14} /> },
  { key: "domain",    label: "Domain",    icon: <FiGlobe size={14} /> },
  { key: "fees",      label: "Fees",      icon: <FiDollarSign size={14} /> },
  { key: "gateway",   label: "Gateway",   icon: <FiCreditCard size={14} /> },
  { key: "templates", label: "Templates", icon: <FiLayout size={14} /> },
];

// ======================= SHARED COMPONENTS =======================

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}

function SaveBtn({ loading, onClick, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
    >
      <FiSave size={14} />
      {loading ? "Saving..." : label}
    </button>
  );
}

// ======================= BRANDING TAB =======================

function BrandingTab({ settings, onSaved }) {
  const [brandName, setBrandName] = useState(settings.brandName || "");
  const [logo, setLogo]           = useState(settings.logo || "");
  const [themeColor, setThemeColor] = useState(settings.themeColor || "#1e40af");
  const [loading, setLoading]     = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/branding", { brandName, logo, themeColor });
      toast.success("Branding updated");
      onSaved({ brandName, logo, themeColor });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save branding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div
        className="flex items-center gap-4 p-5 rounded-xl"
        style={{ backgroundColor: themeColor }}
      >
        {logo && (
          <img
            src={logo}
            alt="logo"
            className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1"
          />
        )}
        <span className="text-white font-bold text-lg">
          {brandName || "Your Panel Name"}
        </span>
      </div>

      <Field label="Brand Name">
        <Input value={brandName} onChange={setBrandName} placeholder="e.g. MyBoostPanel" />
      </Field>

      <Field label="Logo URL" hint="Direct link to your logo image (PNG/SVG recommended)">
        <Input value={logo} onChange={setLogo} placeholder="https://yoursite.com/logo.png" />
        {logo && (
          <img src={logo} alt="preview" className="h-10 mt-2 rounded object-contain border p-1" />
        )}
      </Field>

      <Field label="Theme Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-16 border-0 p-0 rounded cursor-pointer"
          />
          <span className="text-sm font-mono text-gray-600">{themeColor}</span>
        </div>
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}

// ======================= SUPPORT TAB =======================

function SupportTab({ settings, onSaved }) {
  const [whatsapp, setWhatsapp] = useState(settings.supportWhatsapp || "");
  const [telegram, setTelegram] = useState(settings.supportTelegram || "");
  const [channel, setChannel]   = useState(settings.supportWhatsappChannel || "");
  const [loading, setLoading]   = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/support", {
        supportWhatsapp: whatsapp,
        supportTelegram: telegram,
        supportWhatsappChannel: channel,
      });
      toast.success("Support links updated");
      onSaved({
        supportWhatsapp: whatsapp,
        supportTelegram: telegram,
        supportWhatsappChannel: channel,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save support links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        These links will be shown to your users on their dashboard as support options.
      </p>

      <Field label="WhatsApp" hint="Phone number or wa.me link">
        <Input value={whatsapp} onChange={setWhatsapp} placeholder="+1234567890 or https://wa.me/1234567890" />
      </Field>

      <Field label="Telegram" hint="@username or t.me link">
        <Input value={telegram} onChange={setTelegram} placeholder="@yourusername" />
      </Field>

      <Field label="WhatsApp Channel / Group" hint="Community or broadcast link">
        <Input value={channel} onChange={setChannel} placeholder="https://chat.whatsapp.com/..." />
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}

// ======================= DOMAIN TAB =======================

function DomainTab({ settings }) {
  const [domainType, setDomainType]     = useState(settings.domain ? "custom" : "subdomain");
  const [customDomain, setCustomDomain] = useState(settings.domain || "");
  const [loading, setLoading]           = useState(false);

  const slug = (settings.brandName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const save = async () => {
    if (domainType === "custom" && !customDomain.trim()) {
      return toast.error("Enter a custom domain");
    }
    setLoading(true);
    try {
      const domain =
        domainType === "subdomain"
          ? `${slug}.marinepanel.online`
          : customDomain.trim();

      await API.put("/cp/settings/domain", { customDomain: domain });
      toast.success("Domain updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update domain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Choose how users access your panel. Subdomain is free and instant.
        Custom domain requires you to point a CNAME record to{" "}
        <span className="font-mono text-blue-600">marinepanel.online</span>.
      </p>

      {/* Subdomain */}
      <label
        className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
          domainType === "subdomain"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <input
          type="radio"
          value="subdomain"
          checked={domainType === "subdomain"}
          onChange={() => setDomainType("subdomain")}
          className="mt-0.5"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <FiZap className="text-blue-500" /> Free Subdomain
          </p>
          <p className="text-xs text-blue-500 mt-0.5">
            {slug ? `${slug}.marinepanel.online` : "yourbrand.marinepanel.online"}
          </p>
        </div>
      </label>

      {/* Custom domain */}
      <label
        className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
          domainType === "custom"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <input
          type="radio"
          value="custom"
          checked={domainType === "custom"}
          onChange={() => setDomainType("custom")}
          className="mt-0.5"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <FiGlobe className="text-blue-500" /> Custom Domain
          </p>
          <p className="text-xs text-gray-400 mt-0.5">e.g. panel.yourdomain.com</p>
          {domainType === "custom" && (
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              onClick={(e) => e.preventDefault()}
              placeholder="panel.yourdomain.com"
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>
      </label>

      {/* DNS guide */}
      {domainType === "custom" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 space-y-1">
          <p className="font-semibold">DNS Setup Required</p>
          <p>Add this CNAME record to your domain's DNS settings:</p>
          <p className="font-mono bg-yellow-100 px-2 py-1 rounded">
            CNAME → marinepanel.online
          </p>
          <p className="text-yellow-600">DNS changes can take up to 48 hours to propagate.</p>
        </div>
      )}

      <SaveBtn loading={loading} onClick={save} label="Update Domain" />
    </div>
  );
}

// ======================= FEES TAB =======================

function FeesTab({ settings, onSaved }) {
  const [activationFee, setActivationFee] = useState(settings.resellerActivationFee ?? 25);
  const [withdrawMin, setWithdrawMin]     = useState(settings.withdrawMin ?? 10);
  const [loading, setLoading]             = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/reseller-fees", {
        resellerActivationFee: Number(activationFee),
        withdrawMin: Number(withdrawMin),
      });
      toast.success("Fees updated");
      onSaved({
        resellerActivationFee: Number(activationFee),
        withdrawMin: Number(withdrawMin),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Read-only billing info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">
          Billing (set by platform — read only)
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">Mode: </span>
            <span className="font-semibold capitalize text-gray-800">
              {settings.billingMode || "—"}
            </span>
          </div>
          {(settings.billingMode === "monthly" || settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Monthly Fee: </span>
              <span className="font-semibold text-gray-800">${settings.monthlyFee ?? 0}</span>
            </div>
          )}
          {(settings.billingMode === "per_order" || settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Per-Order Fee: </span>
              <span className="font-semibold text-gray-800">${settings.perOrderFee ?? 0}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Your Commission: </span>
            <span className="font-semibold text-green-600">{settings.commissionRate ?? 0}%</span>
          </div>
        </div>
      </div>

      <Field
        label="Reseller Activation Fee"
        hint="Fee you charge when a user activates as a reseller on your panel"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={activationFee}
            onChange={(e) => setActivationFee(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </Field>

      <Field
        label="Minimum Withdrawal"
        hint="Minimum amount your panel wallet must reach before you can withdraw"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={withdrawMin}
            onChange={(e) => setWithdrawMin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}

// ======================= GATEWAY TAB =======================

function GatewayTab({ settings, onSaved }) {
  const [paymentMode, setPaymentMode] = useState(settings.paymentMode || "none");
  const [serviceMode, setServiceMode] = useState(settings.serviceMode || "none");
  const [savingPay, setSavingPay]     = useState(false);
  const [savingSvc, setSavingSvc]     = useState(false);

  const savePayment = async () => {
    setSavingPay(true);
    try {
      await API.put("/cp/settings/payment-mode", { paymentMode });
      toast.success("Payment mode updated");
      onSaved({ paymentMode });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment mode");
    } finally {
      setSavingPay(false);
    }
  };

  const saveService = async () => {
    setSavingSvc(true);
    try {
      await API.put("/cp/settings/service-mode", { serviceMode });
      toast.success("Service mode updated");
      onSaved({ serviceMode });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update service mode");
    } finally {
      setSavingSvc(false);
    }
  };

  const PayOption = ({ value, title, desc }) => (
    <label
      className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
        paymentMode === value
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <input
        type="radio"
        value={value}
        checked={paymentMode === value}
        onChange={() => setPaymentMode(value)}
        className="mt-0.5"
      />
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );

  const SvcOption = ({ value, title, desc }) => (
    <label
      className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
        serviceMode === value
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <input
        type="radio"
        value={value}
        checked={serviceMode === value}
        onChange={() => setServiceMode(value)}
        className="mt-0.5"
      />
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );

  return (
    <div className="space-y-8">

      {/* Payment mode */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Payment Gateway</p>
          <p className="text-xs text-gray-400 mt-0.5">
            How users on your panel make deposits
          </p>
        </div>
        <PayOption
          value="platform"
          title="Use Platform Gateway"
          desc="Your users deposit via the main platform's Paystack. Money goes to the platform and you earn it into your wallet to withdraw."
        />
        <PayOption
          value="own"
          title="Use My Own Gateway"
          desc="Connect your own payment provider. Deposits go directly to your account."
        />
        <PayOption
          value="none"
          title="Not Connected"
          desc="No payment method active. Users cannot deposit on your panel."
        />
        <SaveBtn loading={savingPay} onClick={savePayment} label="Save Payment Mode" />
      </div>

      <div className="border-t" />

      {/* Service mode */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Service Source</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Where your panel's services come from
          </p>
        </div>
        <SvcOption
          value="platform"
          title="Platform Services"
          desc="Use services from the main platform. No provider API setup needed."
        />
        <SvcOption
          value="own"
          title="My Own Providers"
          desc="Use only your own provider API keys. Full control over pricing."
        />
        <SvcOption
          value="both"
          title="Both"
          desc="Mix platform services with your own providers."
        />
        <SvcOption
          value="none"
          title="Not Connected"
          desc="No services active. Users cannot place orders."
        />
        <SaveBtn loading={savingSvc} onClick={saveService} label="Save Service Mode" />
      </div>
    </div>
  );
}

// ======================= TEMPLATES TAB =======================
//
// Shows all available templates as visual cards.
// The CP owner clicks one to select it, then clicks Apply.
// On apply: PUT /cp/settings/template { templateId }
// On success: calls refetch() from ChildPanelContext so the
// branding object (including templateId) updates site-wide
// immediately without a page reload.

// Style tag metadata shown under each template name
const STYLE_ICONS = {
  "Hidden ≡ Menu · No Header · Dark":      <FiMenu size={12} />,
  "Bottom Nav · Minimal · Mobile-First":   <FiSmartphone size={12} />,
  "Sidebar · Dark · Neon Glow":            <FiMonitor size={12} />,
  "Header + Footer · Professional · Blue": <FiLayout size={12} />,
};

// Mini mock screen preview inside each card
// Shows the layout style at a glance as a tiny wireframe
function LayoutPreview({ templateId }) {
  // Aurora — no header/footer, hamburger top-left
  if (templateId === "aurora") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1.5">
        <div className="flex items-center justify-between">
          <div className="w-4 h-3 rounded-sm bg-white/20 flex flex-col justify-center gap-0.5 px-0.5">
            <div className="h-px bg-white/60 rounded" />
            <div className="h-px bg-white/60 rounded" />
            <div className="h-px bg-white/60 rounded" />
          </div>
          <div className="w-8 h-2 rounded-full bg-white/20" />
          <div className="w-6 h-2 rounded-full bg-white/30" />
        </div>
        <div className="flex-1 flex flex-col gap-1 mt-1">
          <div className="w-3/4 h-2 rounded bg-white/20" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-1/2 h-2 rounded bg-white/10" />
          <div className="mt-auto w-full h-5 rounded-lg bg-white/20" />
        </div>
      </div>
    );
  }

  // Pulse — floating bottom pill nav, clean top bar
  if (templateId === "pulse") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1.5 bg-gray-50/10">
        <div className="flex items-center justify-between bg-white/30 rounded px-1.5 py-1">
          <div className="w-5 h-1.5 rounded bg-white/60" />
          <div className="w-8 h-1.5 rounded-full bg-white/40" />
        </div>
        <div className="flex-1 flex flex-col gap-1 px-0.5">
          <div className="w-3/4 h-1.5 rounded bg-white/30" />
          <div className="w-full h-10 rounded-xl bg-white/20" />
        </div>
        <div className="flex justify-center">
          <div className="w-3/4 h-4 rounded-full bg-white/40 flex items-center justify-around px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Neon — left sidebar + content area
  if (templateId === "neon") {
    return (
      <div className="w-full h-full flex gap-1.5 p-2">
        <div className="w-8 flex flex-col gap-1 flex-shrink-0">
          <div className="w-full h-3 rounded bg-white/20" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-2 rounded bg-white/10" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-3/4 h-2 rounded bg-white/20" />
          <div className="w-full h-2 rounded bg-white/10" />
          <div className="w-full flex-1 rounded-lg bg-white/10" />
        </div>
      </div>
    );
  }

  // Tide — top header + content + bottom footer
  if (templateId === "tide") {
    return (
      <div className="w-full h-full flex flex-col p-2 gap-1">
        <div className="w-full h-4 rounded bg-white/30 flex items-center px-1.5 gap-1">
          <div className="w-4 h-1.5 rounded bg-white/70" />
          <div className="flex-1" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-4 h-1.5 rounded bg-white/40" />
          ))}
        </div>
        <div className="flex-1 flex gap-1">
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-3/4 h-1.5 rounded bg-white/20" />
            <div className="w-full h-14 rounded-lg bg-white/15" />
          </div>
          <div className="w-10 flex flex-col gap-1">
            <div className="w-full h-8 rounded bg-white/15" />
            <div className="w-full h-8 rounded bg-white/15" />
          </div>
        </div>
        <div className="w-full h-3 rounded bg-white/25" />
      </div>
    );
  }

  return null;
}

function TemplatesTab({ settings, onSaved }) {
  const { refetch } = useChildPanel();
  const templates   = getAllTemplates();

  // Active = already saved in DB. Selected = what user clicked in UI.
  const [activeId,   setActiveId]   = useState(settings.templateId || null);
  const [selectedId, setSelectedId] = useState(settings.templateId || null);
  const [saving,     setSaving]     = useState(false);
  const [preview,    setPreview]    = useState(null); // template being hovered for detail view

  const hasChanged = selectedId !== activeId;

  const handleApply = async () => {
    if (!selectedId) return toast.error("Select a template first");
    if (!hasChanged)  return toast("Already using this template");

    setSaving(true);
    try {
      await API.put("/cp/settings/template", { templateId: selectedId });
      toast.success("Template applied! Your end users will see the new look.");
      setActiveId(selectedId);
      onSaved({ templateId: selectedId });
      // Refresh ChildPanelContext branding so templateId is live everywhere
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply template");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      await API.put("/cp/settings/template", { templateId: null });
      toast.success("Template removed. Default pages restored.");
      setActiveId(null);
      setSelectedId(null);
      onSaved({ templateId: null });
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Section intro */}
      <div>
        <h3 className="text-sm font-bold text-gray-800">Choose a Template</h3>
        <p className="text-xs text-gray-500 mt-1">
          Your end users will see the selected template when they visit your
          panel — on login, home, wallet, orders, services, and profile pages.
          Your admin panel is never affected.
        </p>
      </div>

      {/* Currently active banner */}
      {activeId && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <FiCheck size={15} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Active Template:{" "}
                <span className="capitalize">{activeId}</span>
              </p>
              <p className="text-xs text-green-600">
                Your end users are currently seeing this template.
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={saving}
            className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline disabled:opacity-50 flex-shrink-0 ml-4"
          >
            Remove
          </button>
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          const isActive   = activeId   === tpl.id;

          return (
            <button
              key={tpl.id}
              onClick={() => setSelectedId(tpl.id)}
              className="text-left rounded-2xl border-2 overflow-hidden transition-all focus:outline-none group"
              style={{
                borderColor: isSelected ? tpl.accent : "#e5e7eb",
                boxShadow: isSelected
                  ? `0 0 0 4px ${tpl.accent}20`
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              {/* Visual preview area */}
              <div
                className="relative h-36 w-full overflow-hidden"
                style={{ background: tpl.preview }}
              >
                {/* Wireframe layout preview */}
                <div className="absolute inset-0">
                  <LayoutPreview templateId={tpl.id} />
                </div>

                {/* Template name watermark */}
                <div
                  className="absolute bottom-2 left-3 text-xs font-black tracking-wider uppercase opacity-40"
                  style={{ color: tpl.accent }}
                >
                  {tpl.name}
                </div>

                {/* Active badge */}
                {isActive && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: tpl.accent, color: "#fff" }}
                  >
                    <FiCheck size={10} /> Live
                  </div>
                )}

                {/* Selected checkmark overlay */}
                {isSelected && !isActive && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: tpl.accent }}
                  >
                    <FiCheck size={12} color="#fff" />
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">{tpl.name}</p>
                  {/* Accent dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: tpl.accent }}
                  />
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Style tag */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${tpl.accent}14`,
                      color: tpl.accent,
                    }}
                  >
                    {STYLE_ICONS[tpl.style]}
                    {tpl.style}
                  </span>
                </div>

                {/* Pages this template covers */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {["Login", "Register", "Home", "Wallet", "Orders", "Services", "Profile"].map((page) => (
                    <span
                      key={page}
                      className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3 pt-2 flex-wrap">
        <button
          onClick={handleApply}
          disabled={saving || !selectedId || !hasChanged}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: selectedId
              ? templates.find((t) => t.id === selectedId)?.accent || "#3b82f6"
              : "#9ca3af",
            boxShadow: selectedId && hasChanged
              ? `0 4px 14px ${templates.find((t) => t.id === selectedId)?.accent}44`
              : "none",
          }}
        >
          <FiCheck size={14} />
          {saving
            ? "Applying..."
            : hasChanged && selectedId
            ? `Apply ${templates.find((t) => t.id === selectedId)?.name || ""} Template`
            : "Template Applied"}
        </button>

        {/* Hint when nothing changed */}
        {!hasChanged && activeId && (
          <p className="text-xs text-gray-400">
            Click a different template card to switch.
          </p>
        )}
        {!hasChanged && !activeId && (
          <p className="text-xs text-gray-400">
            Select a template card above, then click Apply.
          </p>
        )}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">How templates work</p>
        <p>
          Templates only change what your <strong>end users</strong> see.
          Your admin panel (Settings, Users, Orders, etc.) always stays the same.
        </p>
        <p>
          Your brand name, logo, and theme color from the Branding tab are
          applied inside every template — so the template always reflects your brand.
        </p>
        <p>
          Switching templates is instant and reversible at any time.
        </p>
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelSettings() {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/cp/settings");
        setSettings(res.data);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When a tab saves, merge the new values into local settings state
  // and also refresh the AuthContext user so sidebar brand name
  // updates instantly without a page reload
  const handleSaved = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (updateUser && (patch.brandName || patch.themeColor || patch.logo)) {
      updateUser({
        childPanelBrandName:  patch.brandName,
        childPanelThemeColor: patch.themeColor,
        childPanelLogo:       patch.logo,
      });
    }
  };

  if (loading) {
    return (
      <ChildPanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ChildPanelLayout>
    );
  }

  return (
    <ChildPanelLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your panel branding, domain, fees, gateway, and templates
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === t.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {activeTab === "branding" && (
            <BrandingTab settings={settings} onSaved={handleSaved} />
          )}
          {activeTab === "support" && (
            <SupportTab settings={settings} onSaved={handleSaved} />
          )}
          {activeTab === "domain" && (
            <DomainTab settings={settings} onSaved={handleSaved} />
          )}
          {activeTab === "fees" && (
            <FeesTab settings={settings} onSaved={handleSaved} />
          )}
          {activeTab === "gateway" && (
            <GatewayTab settings={settings} onSaved={handleSaved} />
          )}
          {activeTab === "templates" && (
            <TemplatesTab settings={settings} onSaved={handleSaved} />
          )}
        </div>

      </div>
    </ChildPanelLayout>
  );
            }
