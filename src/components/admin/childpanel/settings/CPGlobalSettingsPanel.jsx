// src/components/admin/childpanel/settings/CPGlobalSettingsPanel.jsx

import { useEffect, useState } from "react";
import { FiSettings, FiList } from "react-icons/fi";
import API from "../../../../api/axios";
import toast from "react-hot-toast";
import CPFeesTab   from "./CPFeesTab";
import CPGuidesTab from "./CPGuidesTab";

const TABS = [
  { id: "fees",   label: "Fees & Billing", icon: <FiSettings size={13} /> },
  { id: "guides", label: "Guidelines",     icon: <FiList    size={13} /> },
];

export default function CPGlobalSettingsPanel() {
  const [tab,      setTab]      = useState("fees");
  const [settings, setSettings] = useState(null);
  const [tiers,    setTiers]    = useState([]);
  const [guides,   setGuides]   = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [fRes, gRes] = await Promise.all([
        API.get("/admin/child-panels/settings/fees"),
        API.get("/admin/child-panel-guides"),
      ]);
      const d = fRes.data.data || fRes.data;
      setSettings(d);
      setTiers(d.monthlyTiers || []);
      setGuides(gRes.data || []);
    } catch { toast.error("Failed to load settings"); }
    finally   { setLoading(false); }
  };

  const saveFees = async () => {
    setSaving(true);
    try {
      await API.put("/admin/child-panels/settings/fees", {
        activationFee:       Number(settings.activationFee),
        billingMode:         settings.billingMode,
        monthlyFee:          Number(settings.monthlyFee),
        perOrderFee:         Number(settings.perOrderFee),
        withdrawMin:         Number(settings.withdrawMin),
        minDeposit:          Number(settings.minDeposit),
        monthlyTiers:        tiers,
        billingIntervalDays: Number(settings.billingIntervalDays ?? 30),
      });
      toast.success("Settings saved");
    } catch { toast.error("Failed to save settings"); }
    finally   { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b bg-gray-50">
        {TABS.map((t) => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 transition ${
              tab === t.id
                ? "border-blue-500 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "fees" && settings && (
          <CPFeesTab
            settings={settings}
            tiers={tiers}
            saving={saving}
            onSettingsChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            onTiersChange={setTiers}
            onSave={saveFees}
          />
        )}
        {tab === "guides" && (
          <CPGuidesTab guides={guides} setGuides={setGuides} />
        )}
      </div>
    </div>
  );
  }
