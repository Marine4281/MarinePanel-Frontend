import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { FiZap, FiGlobe } from "react-icons/fi";
import { SaveBtn } from "./SettingsShared";

export default function DomainTab({ settings }) {
  const [domainType,    setDomainType]    = useState(settings.domain ? "custom" : "subdomain");
  const [customDomain,  setCustomDomain]  = useState(settings.domain || "");
  const [loading,       setLoading]       = useState(false);

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

      {/* Subdomain option */}
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

      {/* Custom domain option */}
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
