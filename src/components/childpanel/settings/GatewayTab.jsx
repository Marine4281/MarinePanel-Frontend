import { useState } from "react";
import API from "../../../api/axios";
import toast from "react-hot-toast";
import { SaveBtn } from "./SettingsShared";

function RadioOption({ groupValue, value, onChange, title, desc }) {
  return (
    <label
      className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
        groupValue === value
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <input
        type="radio"
        value={value}
        checked={groupValue === value}
        onChange={() => onChange(value)}
        className="mt-0.5"
      />
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );
}

export default function GatewayTab({ settings, onSaved }) {
  const [paymentMode, setPaymentMode] = useState(settings.paymentMode || "none");
  const [serviceMode, setServiceMode] = useState(settings.serviceMode || "none");
  const [savingPay,   setSavingPay]   = useState(false);
  const [savingSvc,   setSavingSvc]   = useState(false);

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

  return (
    <div className="space-y-8">
      {/* Payment mode */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Payment Gateway</p>
          <p className="text-xs text-gray-400 mt-0.5">How users on your panel make deposits</p>
        </div>
        <RadioOption groupValue={paymentMode} onChange={setPaymentMode} value="platform"
          title="Use Platform Gateway"
          desc="Your users deposit via the main platform's Paystack. Money goes to the platform and you earn it into your wallet to withdraw." />
        <RadioOption groupValue={paymentMode} onChange={setPaymentMode} value="own"
          title="Use My Own Gateway"
          desc="Connect your own payment provider. Deposits go directly to your account." />
        <RadioOption groupValue={paymentMode} onChange={setPaymentMode} value="none"
          title="Not Connected"
          desc="No payment method active. Users cannot deposit on your panel." />
        <SaveBtn loading={savingPay} onClick={savePayment} label="Save Payment Mode" />
      </div>

      <div className="border-t" />

      {/* Service mode */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Service Source</p>
          <p className="text-xs text-gray-400 mt-0.5">Where your panel's services come from</p>
        </div>
        <RadioOption groupValue={serviceMode} onChange={setServiceMode} value="platform"
          title="Platform Services"
          desc="Use services from the main platform. No provider API setup needed." />
        <RadioOption groupValue={serviceMode} onChange={setServiceMode} value="own"
          title="My Own Providers"
          desc="Use only your own provider API keys. Full control over pricing." />
        <RadioOption groupValue={serviceMode} onChange={setServiceMode} value="both"
          title="Both"
          desc="Mix platform services with your own providers." />
        <RadioOption groupValue={serviceMode} onChange={setServiceMode} value="none"
          title="Not Connected"
          desc="No services active. Users cannot place orders." />
        <SaveBtn loading={savingSvc} onClick={saveService} label="Save Service Mode" />
      </div>
    </div>
  );
}
