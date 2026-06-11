import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { Field, Input, SaveBtn } from "./SettingsShared";

export default function SupportTab({ settings, onSaved }) {
  const [whatsapp, setWhatsapp] = useState(settings.supportWhatsapp        || "");
  const [telegram, setTelegram] = useState(settings.supportTelegram        || "");
  const [channel,  setChannel]  = useState(settings.supportWhatsappChannel || "");
  const [loading,  setLoading]  = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await API.put("/cp/settings/support", {
        supportWhatsapp:        whatsapp,
        supportTelegram:        telegram,
        supportWhatsappChannel: channel,
      });
      toast.success("Support links updated");
      onSaved({
        supportWhatsapp:        whatsapp,
        supportTelegram:        telegram,
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
