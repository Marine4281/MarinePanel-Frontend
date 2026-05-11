// src/pages/payment/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const [countdown,     setCountdown] = useState(5);
  const reference       = params.get("reference") || params.get("trxref") || "";

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); navigate("/wallet"); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#060a12" }}>

      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.3)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 className="text-2xl font-black text-white mb-2">Payment Initiated</h1>
      <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
        Your payment is being processed. Your wallet will be credited once confirmed.
      </p>
      {reference && (
        <p className="text-xs mt-2 font-mono px-3 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          Ref: {reference}
        </p>
      )}

      <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
        Redirecting to wallet in {countdown}s...
      </p>

      <button onClick={() => navigate("/wallet")}
        className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
        Go to Wallet
      </button>
    </div>
  );
}
