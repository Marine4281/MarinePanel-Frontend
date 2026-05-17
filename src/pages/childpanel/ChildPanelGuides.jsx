// src/pages/childpanel/ChildPanelGuides.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";
import { FiBookOpen, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function ChildPanelGuides() {
  const [guides, setGuides]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    API.get("/child-panel/guides?placement=dashboard")
      .then((res) => setGuides(res.data))
      .catch(() => toast.error("Failed to load guides"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i) => setActiveIndex(activeIndex === i ? null : i);

  return (
    <ChildPanelLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-xl">
          <FiBookOpen className="text-blue-500 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Guides</h1>
          <p className="text-sm text-gray-500">
            Learn how to grow and manage your child panel
          </p>
        </div>
      </div>

      {/* Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-gray-400 text-sm">
            Loading guides...
          </div>
        )}

        {!loading && guides.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            No guides available yet
          </div>
        )}

        {!loading &&
          guides.map((guide, i) => (
            <div key={guide._id} className="border-b last:border-none">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
              >
                <span className="font-semibold text-gray-800 text-sm">
                  {guide.title}
                </span>
                {activeIndex === i ? (
                  <FiChevronUp className="text-blue-500 shrink-0" />
                ) : (
                  <FiChevronDown className="text-gray-400 shrink-0" />
                )}
              </button>

              {activeIndex === i && (
                <div className="px-5 pb-5">
                  <div className="bg-gray-50 border rounded-xl p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {guide.content}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </ChildPanelLayout>
  );
            }
