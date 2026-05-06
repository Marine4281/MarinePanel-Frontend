// src/pages/TermsPublic.jsx
//
// Bare Terms & Conditions page — no Header, Footer, or back button.
// Linked from the Register page. Brand-aware (name + color swap by domain type).

import { useEffect } from "react";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";

export default function TermsPublic() {
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  const brand =
    domainType === "childPanel" && childPanel
      ? { name: childPanel.brandName || "Panel", color: childPanel.themeColor || "#f97316" }
      : domainType === "reseller" && reseller
      ? { name: reseller.brandName || "Panel", color: reseller.themeColor || "#f97316" }
      : { name: "MarinePanel", color: "#f97316" };

  useEffect(() => {
    document.title = `Terms & Conditions — ${brand.name}`;
  }, [brand.name]);

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By creating an account on ${brand.name} ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.`,
    },
    {
      id: "description",
      title: "2. Platform Description",
      content: `${brand.name} is a Social Media Marketing (SMM) panel that allows users to purchase engagement services such as followers, likes, and views for social media platforms.`,
    },
    {
      id: "eligibility",
      title: "3. Eligibility",
      bullets: [
        "You must be at least 18 years old to create an account.",
        "You are responsible for providing accurate registration information.",
        "One account per person. Duplicate accounts may be suspended.",
      ],
    },
    {
      id: "services",
      title: "4. Services & Orders",
      bullets: [
        "Delivery times are estimates, not guarantees.",
        "Orders are non-refundable once processing has begun.",
        `${brand.name} reserves the right to cancel orders that violate our policies and issue wallet credit at our discretion.`,
        `${brand.name} does not guarantee results — social media platforms may remove delivered engagement at any time.`,
      ],
    },
    {
      id: "payments",
      title: "5. Payments & Wallet",
      bullets: [
        "All payments are credited to your wallet balance.",
        "Wallet balances are non-transferable and non-refundable unless otherwise stated.",
        "Chargebacks will result in immediate account suspension and a permanent ban.",
      ],
    },
    {
      id: "reseller",
      title: "6. Reseller Terms",
      content: `Resellers are responsible for managing their own end users and setting appropriate pricing. ${brand.name} is not liable for any disputes between resellers and their end users.`,
    },
    {
      id: "prohibited",
      title: "7. Prohibited Activities",
      intro: "You may not use the Platform to:",
      bullets: [
        "Violate any applicable law or regulation",
        "Target government, military, or critical infrastructure accounts",
        "Engage in fraudulent payments or chargebacks",
        "Attempt to hack, reverse-engineer, or disrupt the Platform",
        "Abuse the support or refund systems",
      ],
    },
    {
      id: "suspension",
      title: "8. Account Suspension & Termination",
      intro: `${brand.name} reserves the right to suspend or terminate any account at our discretion, including for:`,
      bullets: [
        "Fraudulent activity",
        "Chargeback disputes",
        "Violation of these Terms",
        "Abuse of support or refund systems",
      ],
    },
    {
      id: "liability",
      title: "9. Limitation of Liability",
      content: `${brand.name} is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including loss of followers, account actions by social media platforms, or service interruptions.`,
    },
    {
      id: "privacy",
      title: "10. Privacy",
      content: `Your data is handled responsibly and in accordance with applicable privacy laws. We do not sell personal data to third parties.`,
    },
    {
      id: "changes",
      title: "11. Changes to Terms",
      content: `We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify users of major changes via email or dashboard notice.`,
    },
    {
      id: "contact",
      title: "12. Contact",
      content: `For questions about these Terms, please contact us through the support channels available on the Platform.`,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero header */}
      <div
        className="px-6 py-10 text-white"
        style={{ backgroundColor: brand.color }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
          Legal
        </p>
        <h1 className="text-2xl font-extrabold mb-1">Terms & Conditions</h1>
        <p className="text-xs opacity-60">
          {brand.name} · Effective date: May 5, 2026
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 pb-16">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-1 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: brand.color }}
              />
              <h2 className="text-sm font-bold text-gray-800">{s.title}</h2>
            </div>

            {s.intro && (
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                {s.intro}
              </p>
            )}

            {s.content && (
              <p className="text-gray-500 text-sm leading-relaxed">{s.content}</p>
            )}

            {s.bullets && (
              <ul className="space-y-1.5 mt-1">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brand.color }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-center text-xs text-gray-300 pt-4">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
