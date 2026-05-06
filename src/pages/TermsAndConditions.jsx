// src/pages/TermsAndConditions.jsx
//
// Brand-aware Terms & Conditions page.
// - Main platform  → "MarinePanel" in orange
// - Reseller domain → reseller brand name + theme color
// - Child panel domain → child panel brand name + theme color
//
// Linked from the Reseller page (/resellers). No checkbox required.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReseller } from "../context/ResellerContext";
import { useChildPanel } from "../context/ChildPanelContext";
import { useCachedServices } from "../context/CachedServicesContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const { reseller } = useReseller();
  const { childPanel } = useChildPanel();
  const { domainType } = useCachedServices();

  // Resolve brand name and theme color based on domain type
  const brand =
    domainType === "childPanel" && childPanel
      ? { name: childPanel.brandName || "Panel", color: childPanel.themeColor || "#f97316" }
      : domainType === "reseller" && reseller
      ? { name: reseller.brandName || "Panel", color: reseller.themeColor || "#f97316" }
      : { name: "MarinePanel", color: "#f97316" };

  // Update page title to match brand
  useEffect(() => {
    document.title = `Terms & Conditions — ${brand.name}`;
    return () => { document.title = brand.name; };
  }, [brand.name]);

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing or using ${brand.name} ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.`,
    },
    {
      id: "description",
      title: "2. Platform Description",
      content: `${brand.name} is a Social Media Marketing (SMM) panel that allows users to purchase engagement services such as followers, likes, and views for social media platforms. The Platform operates across multiple user tiers including standard users and resellers.`,
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
        `Orders are non-refundable once processing has begun.`,
        `${brand.name} reserves the right to cancel orders that violate our policies and issue wallet credit at our discretion.`,
        `${brand.name} does not guarantee results — social media platforms may remove delivered engagement at any time.`,
      ],
    },
    {
      id: "payments",
      title: "5. Payments & Wallet",
      bullets: [
        "All payments are in USD and are credited to your wallet.",
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 pb-28">

        {/* Page header */}
        <div
          className="rounded-2xl px-8 py-10 mb-8 text-white"
          style={{ backgroundColor: brand.color }}
        >
          <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-1">
            Legal
          </p>
          <h1 className="text-3xl font-extrabold mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm opacity-75">
            {brand.name} &nbsp;·&nbsp; Effective date: May 5, 2026
          </p>
        </div>

        {/* Quick jump anchors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Contents
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs px-3 py-1 rounded-full border font-medium transition"
                style={{
                  borderColor: brand.color,
                  color: brand.color,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = brand.color;
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = brand.color;
                }}
              >
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 scroll-mt-20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: brand.color }}
                />
                <h2 className="text-base font-bold text-gray-800">
                  {s.title}
                </h2>
              </div>

              {s.intro && (
                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                  {s.intro}
                </p>
              )}

              {s.content && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {s.content}
                </p>
              )}

              {s.bullets && (
                <ul className="space-y-1.5 mt-1">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
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
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium underline underline-offset-4"
            style={{ color: brand.color }}
          >
            ← Back
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
