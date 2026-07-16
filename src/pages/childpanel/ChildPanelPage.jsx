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
    icon: <FiGlobe className="text-blue-600" size={20} />,
    title: "Your Own Branded Panel",
    desc: "Launch on a custom domain with your logo, colors, and brand identity.",
  },
  {
    icon: <FiUsers className="text-blue-600" size={20} />,
    title: "Full User & Reseller Management",
    desc: "Onboard users, create resellers, set pricing tiers, and manage everything.",
  },
  {
    icon: <FiServer className="text-blue-600" size={20} />,
    title: "Add Your Own Providers",
    desc: "Connect external SMM API providers directly to your panel.",
  },
  {
    icon: <FiShield className="text-blue-600" size={20} />,
    title: "Payment Gateway Integration",
    desc: "Accept payments via your own gateway — you keep 100% of your revenue.",
  },
  {
    icon: <FiTrendingUp className="text-blue-600" size={20} />,
    title: "Analytics & Reporting",
    desc: "Track orders, revenue, user growth, and reseller performance in real time.",
  },
  {
    icon: <FiZap className="text-blue-600" size={20} />,
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
      if (user.isChildPanel) {
        // Always send CP owners toward the dashboard route.
        // ChildPanelRoute handles suspension/expiry blocking from there.
        navigate("/child-panel/dashboard");
        return;
      }
      fetchGuides();
      setCheckingStatus(false);
    }
  }, [user, navigate]);

  const fetchGuides = async () => {
    try {
      setLoadingGuides(true);
      const res = await API.get("/child-panel/guides?placement=activation");
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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans antialiased text-gray-800">
      <Header />

      <main className="flex-1 w-full">

        {/* ── HERO SECTION ── */}
        <div className="relative border-b border-gray-200 bg-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            
            {/* Minimalist Badge */}
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3.5 py-1 rounded-full mb-6">
              Platform Tier
            </span>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
              Launch Your Branded <br />
              <span className="text-blue-600">SMM Child Panel</span>
            </h1>

            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Build an independent SMM platform under your domain. Complete control over pricing, users, suppliers, and integrations through a single administrative panel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/child-panel/activate")}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-lg shadow-sm transition-colors text-sm"
              >
                Activate Child Panel
              </button>
              <a
                href="#features"
                className="text-gray-600 font-medium hover:text-gray-900 transition text-sm"
              >
                Features Overview
              </a>
            </div>

            {/* Subtle verification points */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
              {["Custom domain alignment", "Brand autonomy", "Independent margins", "Direct integrations"].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <FiCheckCircle size={14} className="text-green-500" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES GRID ── */}
        <div id="features" className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Comprehensive Platform Features
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
              Our child panels provide a fully realized infrastructure, allowing you to operate autonomously as a primary service dealer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPARE CHILD vs RESELLER ── */}
        <div className="bg-white border-y border-gray-200 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Functional Differences
            </h2>
            <p className="text-gray-500 text-sm text-center mb-10 max-w-md mx-auto leading-relaxed">
              Compare capabilities to determine the correct configuration for your scaling requirements.
            </p>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Capability</th>
                    <th className="px-6 py-4 font-semibold text-center">Reseller Panel</th>
                    <th className="px-6 py-4 font-semibold text-center text-blue-700 bg-blue-50/50">
                      Child Panel
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ["Custom domain mapping", true, true],
                    ["Autonomous branding & design", true, true],
                    ["Direct end-user interface", true, true],
                    ["Reseller onboarding capability", false, true],
                    ["Independent supplier configuration", false, true],
                    ["Direct merchant accounts", false, true],
                    ["Sub-API provisioning", false, true],
                    ["Full administrator controls", false, true],
                  ].map(([feat, reseller, child], i) => (
                    <tr key={feat} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 font-medium">{feat}</td>
                      <td className="px-6 py-3.5 text-center">
                        {reseller ? (
                          <FiCheckCircle className="inline text-green-600" size={16} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center bg-blue-50/20">
                        {child ? (
                          <FiCheckCircle className="inline text-blue-600" size={16} />
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
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Integration Guides
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Review instructions and technical documentation for setting up your platform.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loadingGuides && (
              <div className="p-8 text-center text-gray-400 text-sm">
                Loading documentation...
              </div>
            )}

            {!loadingGuides && guides.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No setup guides available.
              </div>
            )}

            {!loadingGuides &&
              guides.map((guide, index) => (
                <div key={guide._id} className="border-b last:border-none border-gray-200">
                  <button
                    onClick={() => toggleGuide(index)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 text-sm">{guide.title}</span>
                    {activeIndex === index ? (
                      <FiChevronUp className="text-blue-600 shrink-0" />
                    ) : (
                      <FiChevronDown className="text-gray-400 shrink-0" />
                    )}
                  </button>
                  {activeIndex === index && (
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {guide.content}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="bg-white border-t border-gray-200 py-16 text-center px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Establish Your Platform
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Configure your administrative settings, map your domain, and launch a branded system.
          </p>
          <button
            onClick={() => navigate("/child-panel/activate")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3.5 rounded-lg shadow-sm transition-colors text-sm"
          >
            Activate Child Panel
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
