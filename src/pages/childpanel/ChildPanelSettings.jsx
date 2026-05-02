// src/pages/childpanel/ChildPanelSettings.jsx
//
// All child panel owner settings in one tabbed page.
// Tabs: Branding | Support | Domain | Fees | Gateway
// Hits /cp/settings/* endpoints exclusively.

import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FiGlobe,
  FiZap,
  FiDollarSign,
  FiCreditCard,
  FiMessageCircle,
  FiImage,
  FiSave,
} from "react-icons/fi";

// ======================= TABS =======================

const TABS = [
  { key: "branding", label: "Branding", icon: <FiImage size={14} /> },
  { key: "support", label: "Support", icon: <FiMessageCircle size={14} /> },
  { key: "domain", label: "Domain", icon: <FiGlobe size={14} /> },
  { key: "fees", label: "Fees", icon: <FiDollarSign size={14} /> },
  { key: "gateway", label: "Gateway", icon: <FiCreditCard size={14} /> },
];

// ======================= INPUT =======================

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
  const [logo, setLogo] = useState(settings.logo || "");
  const [themeColor, setThemeColor] = useState(
    settings.themeColor || "#1e40af"
  );
  const [loading, setLoading] = useState(false);

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
        <Input
          value={brandName}
          onChange={setBrandName}
          placeholder="e.g. MyBoostPanel"
        />
      </Field>

      <Field label="Logo URL" hint="Direct link to your logo image (PNG/SVG recommended)">
        <Input
          value={logo}
          onChange={setLogo}
          placeholder="https://yoursite.com/logo.png"
        />
        {logo && (
          <img
            src={logo}
            alt="preview"
            className="h-10 mt-2 rounded object-contain border p-1"
          />
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
  const [channel, setChannel] = useState(
    settings.supportWhatsappChannel || ""
  );
  const [loading, setLoading] = useState(false);

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
        These links will be shown to your users on their dashboard as support
        options.
      </p>

      <Field label="WhatsApp" hint="Phone number or wa.me link">
        <Input
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="+1234567890 or https://wa.me/1234567890"
        />
      </Field>

      <Field label="Telegram" hint="@username or t.me link">
        <Input
          value={telegram}
          onChange={setTelegram}
          placeholder="@yourusername"
        />
      </Field>

      <Field label="WhatsApp Channel / Group" hint="Community or broadcast link">
        <Input
          value={channel}
          onChange={setChannel}
          placeholder="https://chat.whatsapp.com/..."
        />
      </Field>

      <SaveBtn loading={loading} onClick={save} />
    </div>
  );
}

// ======================= DOMAIN TAB =======================

function DomainTab({ settings }) {
  const [domainType, setDomainType] = useState(
    settings.domain ? "custom" : "subdomain"
  );
  const [customDomain, setCustomDomain] = useState(settings.domain || "");
  const [loading, setLoading] = useState(false);

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
          <p className="text-xs text-gray-400 mt-0.5">
            e.g. panel.yourdomain.com
          </p>
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

      {/* DNS guide for custom domain */}
      {domainType === "custom" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 space-y-1">
          <p className="font-semibold">DNS Setup Required</p>
          <p>Add this CNAME record to your domain's DNS settings:</p>
          <p className="font-mono bg-yellow-100 px-2 py-1 rounded">
            CNAME → marinepanel.online
          </p>
          <p className="text-yellow-600">
            DNS changes can take up to 48 hours to propagate.
          </p>
        </div>
      )}

      <SaveBtn loading={loading} onClick={save} label="Update Domain" />
    </div>
  );
}

// ======================= FEES TAB =======================

function FeesTab({ settings, onSaved }) {
  const [activationFee, setActivationFee] = useState(
    settings.resellerActivationFee ?? 25
  );
  const [withdrawMin, setWithdrawMin] = useState(settings.withdrawMin ?? 10);
  const [loading, setLoading] = useState(false);

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
      {/* Read-only billing info from main admin */}
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
          {(settings.billingMode === "monthly" ||
            settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Monthly Fee: </span>
              <span className="font-semibold text-gray-800">
                ${settings.monthlyFee ?? 0}
              </span>
            </div>
          )}
          {(settings.billingMode === "per_order" ||
            settings.billingMode === "both") && (
            <div>
              <span className="text-gray-500">Per-Order Fee: </span>
              <span className="font-semibold text-gray-800">
                ${settings.perOrderFee ?? 0}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Your Commission: </span>
            <span className="font-semibold text-green-600">
              {settings.commissionRate ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Editable fees for their own resellers */}
      <Field
        label="Reseller Activation Fee"
        hint="Fee you charge when a user activates as a reseller on your panel"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
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
  const [paymentMode, setPaymentMode] = useState(
    settings.paymentMode || "none"
  );
  const [serviceMode, setServiceMode] = useState(
    settings.serviceMode || "none"
  );
  const [savingPay, setSavingPay] = useState(false);
  const [savingSvc, setSavingSvc] = useState(false);

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

        <SaveBtn
          loading={savingPay}
          onClick={savePayment}
          label="Save Payment Mode"
        />
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

        <SaveBtn
          loading={savingSvc}
          onClick={saveService}
          label="Save Service Mode"
        />
      </div>
    </div>
  );
}

// ======================= MAIN =======================

export default function ChildPanelSettings() {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/cp/settings");
        setSettings(res.data);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // When a tab saves, merge the new values into settings
  // and also refresh the AuthContext user so sidebar
  // brand name updates instantly without a page reload
  const handleSaved = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (updateUser && (patch.brandName || patch.themeColor || patch.logo)) {
      updateUser({
        childPanelBrandName: patch.brandName,
        childPanelThemeColor: patch.themeColor,
        childPanelLogo: patch.logo,
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
            Configure your panel branding, domain, fees, and gateway
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
        </div>
      </div>
    </ChildPanelLayout>
  );
}
