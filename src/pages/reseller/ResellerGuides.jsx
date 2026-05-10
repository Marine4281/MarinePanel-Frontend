import { useEffect, useState } from "react";
import Sidebar from "../../components/reseller/Sidebar";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
} from "react-icons/fi";

export default function ResellerGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(null);

  // Mobile sidebar
  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  /*
  --------------------------------
  Fetch Dashboard Guides
  --------------------------------
  */
  const fetchGuides = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        "/reseller-guides?placement=dashboard"
      );

      setGuides(res.data);

    } catch (error) {
      console.error(error);

      toast.error("Failed to load guides");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  /*
  --------------------------------
  Toggle Accordion
  --------------------------------
  */
  const toggleGuide = (index) => {
    setActiveIndex(
      activeIndex === index
        ? null
        : index
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">

      {/* SIDEBAR */}

      <Sidebar
        mobileOpen={mobileSidebar}
        onClose={() =>
          setMobileSidebar(false)
        }
      />

      {/* MAIN */}

      <main className="flex-1 p-4 md:p-8">

        {/* MOBILE MENU */}

        <div className="lg:hidden mb-4">

          <button
            onClick={() =>
              setMobileSidebar(true)
            }
            className="bg-white border rounded-lg p-2 shadow-sm"
          >
            <FiMenu className="text-xl" />
          </button>

        </div>

        {/* PAGE HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-3 mb-2">

            <div className="bg-orange-100 p-3 rounded-xl">
              <FiBookOpen className="text-orange-500 text-xl" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                Reseller Guides
              </h1>

              <p className="text-sm text-gray-500">
                Learn how to grow and manage your reseller business
              </p>

            </div>

          </div>

        </div>

        {/* GUIDES */}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {/* LOADING */}

          {loading && (

            <div className="p-8 text-center text-gray-500">
              Loading guides...
            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            guides.length === 0 && (

            <div className="p-8 text-center text-gray-400">
              No guides available
            </div>

          )}

          {/* GUIDE LIST */}

          {!loading &&
            guides.map((guide, index) => (

              <div
                key={guide._id}
                className="border-b last:border-none"
              >

                <button
                  onClick={() =>
                    toggleGuide(index)
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                >

                  <div className="text-left">

                    <h2 className="font-semibold text-gray-800">
                      {guide.title}
                    </h2>

                  </div>

                  {activeIndex === index ? (

                    <FiChevronUp className="text-orange-500" />

                  ) : (

                    <FiChevronDown className="text-gray-400" />

                  )}

                </button>

                {activeIndex === index && (

                  <div className="px-5 pb-5">

                    <div className="bg-gray-50 border rounded-xl p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {guide.content}
                    </div>

                  </div>

                )}

              </div>

            ))}

        </div>

      </main>

    </div>
  );
}
