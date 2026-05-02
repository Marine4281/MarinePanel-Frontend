// src/pages/childpanel/ChildPanelPage.jsx
// Front page shown to users who click "Child Panel" from the main nav.
// If already an active child panel owner → redirect straight to dashboard.
// Otherwise → show premium landing + guidelines + Activate button.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiZap,
  FiUsers,
  FiGlobe,
  FiShield,
  FiTrendingUp,
  FiServer,
} from "react-icons/fi";

const FEATURES = [
  {
    icon: <FiGlobe className="text-indigo-400" size={22} />,
    title: "Your Own Branded Panel",
    desc: "Launch on a custom domain with your logo, colors, and brand identity.",
  },
  {
    icon: <FiUsers className="text-indigo-400" size={22} />,
    title: "Full User & Reseller Management",
    desc: "Onboard users, create resellers, set pricing tiers, and manage everything.",
  },
  {
    icon: <FiServer className="text-indigo-400" size={22} />,
    title: "Add Your Own Providers",
    desc: "Connect external SMM API providers directly to your panel.",
  },
  {
    icon: <FiShield className="text-indigo-400" size={22} />,
    title: "Payment Gateway Integration",
    desc: "Accept payments via your own gateway — you keep 100% of your revenue.",
  },
  {
    icon: <FiTrendingUp className="text-indigo-400" size={22} />,
    title: "Analytics & Reporting",
    desc: "Track orders, revenue, user growth, and reseller performance in real time.",
  },
  {
    icon: <FiZap className="text-indigo-400" size={22} />,
    title: "API Access for Resellers",
    desc: "Your resellers get a full API to automate orders on your panel.",
  },
];

export default function ChildPanelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // If already an active child panel owner → go straight to dashboard
  useEffect(() => {
    if (user) {
      if (user.isChildPanel && user.childPanelIsActive) {
        navigate("/child-panel/dashboard");
      } else {
        fetchGuides();
      }
      setCheckingStatus(false);
    }
  }, [user, navigate]);

  const fetchGuides = async () => {
    try {
      setLoadingGuides(true);
      const res = await API.get("/reseller-guides"); // reuse same guides endpoint
      setGuides(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load guides");
    } finally {
      setLoadingGuides(false);
    }
  };

  const toggleGuide = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full">

        {/* ── HERO SECTION ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <FiZap size={12} className="text-yellow-300" />
              Most Powerful Tier
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              Launch Your Own<br />
              <span className="text-indigo-300">SMM Child Panel</span>
            </h1>

            <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-10">
              Run a fully independent SMM panel under your own brand. Manage users,
              resellers, providers, and payments — all from one powerful dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/child-panel/activate")}
                className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-base"
              >
                🚀 Activate Child Panel
              </button>
              <a
                href="#features"
                className="text-indigo-200 font-medium hover:text-white transition text-sm underline underline-offset-4"
              >
                See what's included ↓
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-indigo-300">
              {["Your domain", "Your brand", "Your revenue", "Full control"].map((b) => (
                <div key={b} className="flex items-center gap-1.5">
                  <FiCheckCircle size={14} className="text-indigo-400" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES GRID ── */}
        <div id="features" className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Everything you need to run a panel
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              A Child Panel is a complete, independent SMM business — not just a
              reseller account. You own the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPARE CHILD vs RESELLER ── */}
        <div className="bg-white border-y border-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Child Panel vs Reseller Panel
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-50 text-gray-700">
                    <th className="text-left px-6 py-4 font-semibold">Feature</th>
                    <th className="px-6 py-4 font-semibold text-center">Reseller</th>
                    <th className="px-6 py-4 font-semibold text-center text-indigo-700">
                      Child Panel ✦
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Custom domain", true, true],
                    ["Own branding & logo", true, true],
                    ["Manage end users", true, true],
                    ["Manage resellers", false, true],
                    ["Add own providers", false, true],
                    ["Own payment gateway", false, true],
                    ["API for your resellers", false, true],
                    ["Full admin dashboard", false, true],
                  ].map(([feat, reseller, child], i) => (
                    <tr key={feat} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-6 py-3 text-gray-700 font-medium">{feat}</td>
                      <td className="px-6 py-3 text-center">
                        {reseller ? (
                          <FiCheckCircle className="inline text-green-500" size={16} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {child ? (
                          <FiCheckCircle className="inline text-indigo-500" size={16} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── GUIDES / FAQ ── */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Getting Started
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
            {loadingGuides && (
              <div className="p-6 text-center text-gray-400 text-sm">
                Loading guides...
              </div>
            )}

            {!loadingGuides && guides.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                No guides available yet.
              </div>
            )}

            {!loadingGuides &&
              guides.map((guide, index) => (
                <div key={guide._id} className="border-b last:border-none">
                  <button
                    onClick={() => toggleGuide(index)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-indigo-50 transition"
                  >
                    <span className="font-medium text-gray-800">{guide.title}</span>
                    {activeIndex === index ? (
                      <FiChevronUp className="text-indigo-500 shrink-0" />
                    ) : (
                      <FiChevronDown className="text-gray-400 shrink-0" />
                    )}
                  </button>
                  {activeIndex === index && (
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                      {guide.content}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-16 text-center px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to own your platform?
          </h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto text-sm">
            Activate your Child Panel today and start building a real SMM business
            under your own brand.
          </p>
          <button
            onClick={() => navigate("/child-panel/activate")}
            className="bg-white text-indigo-700 font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-base"
          >
            🚀 Activate Child Panel
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
