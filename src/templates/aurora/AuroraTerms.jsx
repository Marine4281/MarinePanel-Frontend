// src/templates/aurora/AuroraTerms.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import AuroraLayout from "./AuroraLayout";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms",
    content: (name) => `By accessing or using ${name} ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.` },
  { id: "description", title: "2. Platform Description",
    content: (name) => `${name} is a Social Media Marketing (SMM) panel that allows users to purchase engagement services such as followers, likes, and views for social media platforms. The Platform operates across multiple user tiers including standard users and resellers.` },
  { id: "eligibility", title: "3. Eligibility",
    bullets: [
      "You must be at least 18 years old to create an account.",
      "You are responsible for providing accurate registration information.",
      "One account per person. Duplicate accounts may be suspended.",
    ] },
  { id: "services", title: "4. Services & Orders",
    bullets: (name) => [
      "Delivery times are estimates, not guarantees.",
      "Orders are non-refundable once processing has begun.",
      `${name} reserves the right to cancel orders that violate our policies and issue wallet credit at our discretion.`,
      `${name} does not guarantee results — social media platforms may remove delivered engagement at any time.`,
    ] },
  { id: "payments", title: "5. Payments & Wallet",
    bullets: [
      "All payments are in USD and are credited to your wallet.",
      "Wallet balances are non-transferable and non-refundable unless otherwise stated.",
      "Chargebacks will result in immediate account suspension and a permanent ban.",
    ] },
  { id: "reseller", title: "6. Reseller Terms",
    content: (name) => `Resellers are responsible for managing their own end users and setting appropriate pricing. ${name} is not liable for any disputes between resellers and their end users.` },
  { id: "prohibited", title: "7. Prohibited Activities",
    intro: "You may not use the Platform to:",
    bullets: [
      "Violate any applicable law or regulation",
      "Target government, military, or critical infrastructure accounts",
      "Engage in fraudulent payments or chargebacks",
      "Attempt to hack, reverse-engineer, or disrupt the Platform",
      "Abuse the support or refund systems",
    ] },
  { id: "suspension", title: "8. Account Suspension & Termination",
    intro: (name) => `${name} reserves the right to suspend or terminate any account at our discretion, including for:`,
    bullets: [
      "Fraudulent activity",
      "Chargeback disputes",
      "Violation of these Terms",
      "Abuse of support or refund systems",
    ] },
  { id: "liability", title: "9. Limitation of Liability",
    content: (name) => `${name} is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including loss of followers, account actions by social media platforms, or service interruptions.` },
  { id: "privacy", title: "10. Privacy",
    content: () => `Your data is handled responsibly and in accordance with applicable privacy laws. We do not sell personal data to third parties.` },
  { id: "changes", title: "11. Changes to Terms",
    content: () => `We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify users of major changes via email or dashboard notice.` },
  { id: "contact", title: "12. Contact",
    content: () => `For questions about these Terms, please contact us through the support channels available on the Platform.` },
];

const resolve = (val, name) => (typeof val === "function" ? val(name) : val);

export default function AuroraTerms() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const brand = { color: childPanel?.themeColor || "#a78bfa", name: childPanel?.brandName || "Panel" };

  useEffect(() => {
    document.title = `Terms & Conditions — ${brand.name}`;
    return () => { document.title = brand.name; };
  }, [brand.name]);

  return (
    <AuroraLayout>
      <div className="max-w-lg mx-auto space-y-5 pt-2">
        <div
          className="rounded-2xl px-6 py-8"
          style={{ background: `linear-gradient(135deg, ${brand.color}30, ${brand.color}10)`, border: `1px solid ${brand.color}30` }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: brand.color }}>Legal</p>
          <h1 className="text-2xl font-black text-white mb-1">Terms & Conditions</h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{brand.name} · Effective date: May 5, 2026</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Contents</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ border: `1px solid ${brand.color}44`, color: brand.color }}>
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="rounded-2xl p-5 scroll-mt-20" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: brand.color }} />
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
              </div>
              {s.intro && <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>{resolve(s.intro, brand.name)}</p>}
              {s.content && <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{resolve(s.content, brand.name)}</p>}
              {s.bullets && (
                <ul className="space-y-1.5 mt-1">
                  {resolve(s.bullets, brand.name).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: brand.color }} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="text-center pb-4">
          <button onClick={() => navigate(-1)} className="text-xs font-semibold underline underline-offset-4" style={{ color: brand.color }}>
            ← Back
          </button>
        </div>
      </div>
    </AuroraLayout>
  );
}
