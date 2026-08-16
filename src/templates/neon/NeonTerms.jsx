// src/templates/neon/NeonTerms.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildPanel } from "../../context/ChildPanelContext";
import NeonLayout from "./NeonLayout";

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

export default function NeonTerms() {
  const navigate = useNavigate();
  const { childPanel } = useChildPanel();
  const neon = childPanel?.themeColor || "#00ff88";
  const name = childPanel?.brandName || "Panel";

  useEffect(() => {
    document.title = `Terms & Conditions — ${name}`;
    return () => { document.title = name; };
  }, [name]);

  return (
    <NeonLayout>
      <div className="max-w-2xl space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${neon}66` }}>Legal</p>
          <h2 className="text-2xl font-black" style={{ color: neon, textShadow: `0 0 16px ${neon}66` }}>Terms & Conditions</h2>
          <p className="text-xs mt-1" style={{ color: "#6c6c92" }}>{name} · Effective date: May 5, 2026</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#5c5c82" }}>Contents</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="text-xs px-3 py-1 rounded-full font-bold"
                style={{ border: `1px solid ${neon}44`, color: neon }}>
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="rounded-2xl p-5 scroll-mt-20" style={{ background: "#1b1b2a", border: `1px solid ${neon}14` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: neon }} />
                <h3 className="text-sm font-black" style={{ color: "#c4c4e0" }}>{s.title}</h3>
              </div>
              {s.intro && <p className="text-xs leading-relaxed mb-2" style={{ color: "#8888a8" }}>{resolve(s.intro, name)}</p>}
              {s.content && <p className="text-xs leading-relaxed" style={{ color: "#8888a8" }}>{resolve(s.content, name)}</p>}
              {s.bullets && (
                <ul className="space-y-1.5 mt-1">
                  {resolve(s.bullets, name).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#8888a8" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: neon }} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="text-center pb-4">
          <button onClick={() => navigate(-1)} className="text-xs font-bold uppercase tracking-widest underline underline-offset-4" style={{ color: neon }}>
            ← Back
          </button>
        </div>
      </div>
    </NeonLayout>
  );
}
