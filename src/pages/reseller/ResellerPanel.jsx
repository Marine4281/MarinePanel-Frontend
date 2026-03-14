// src/pages/reseller/ResellerPanel.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

export default function ResellerPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Redirect if already a reseller
  useEffect(() => {
    if (user) {
      if (user.isReseller) {
        navigate("/reseller/dashboard");
      } else {
        fetchGuides();
      }
      setCheckingStatus(false);
    }
  }, [user, navigate]);

  // Fetch guides
  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reseller-guides");
      setGuides(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load guides");
    } finally {
      setLoading(false);
    }
  };

  const toggleGuide = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Checking reseller status...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Become a Reseller
        </h1>

        <p className="text-gray-600 mb-6">
          Start your own SMM panel and earn profit by selling social media services.
        </p>

        {/* Activate Card */}
        <div className="bg-orange-500 text-white rounded-xl shadow p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Activate Your Reseller Panel
          </h2>

          <p className="text-sm opacity-90 mb-4">
            Launch your own panel, set your prices, and start earning from every order.
          </p>

          <button
            onClick={() => navigate("/reseller/activate")}
            className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Activate Reseller Panel
          </button>
        </div>

        {/* Guides Section */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="border-b px-4 py-3 font-semibold text-gray-700">
            Getting Started
          </div>

          {loading && (
            <div className="p-6 text-center text-gray-500">
              Loading guides...
            </div>
          )}

          {!loading && guides.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No guides available
            </div>
          )}

          {!loading &&
            guides.map((guide, index) => (
              <div key={guide._id} className="border-b last:border-none">
                <button
                  onClick={() => toggleGuide(index)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{guide.title}</span>
                  <i
                    className={`fa-solid ${
                      activeIndex === index
                        ? "fa-chevron-up text-orange-500"
                        : "fa-chevron-down text-gray-400"
                    }`}
                  />
                </button>
                {activeIndex === index && (
                  <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                    {guide.content}
                  </div>
                )}
              </div>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
                      }
