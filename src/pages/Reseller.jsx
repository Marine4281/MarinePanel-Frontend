import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Reseller = () => {
  const items = [
    {
      title: "Services",
      description: "Browse all services available for resellers",
      icon: "fa-layer-group",
      link: "/services",
    },
    {
      title: "Reseller Panel",
      description: "Manage your reseller dashboard and pricing",
      icon: "fa-user-gear",
      link: "/reseller-panel",
    },
    {
      title: "Child Panel",
      description: "Create and manage child SMM panels",
      icon: "fa-network-wired",
      link: "/child-panel",
    },
    {
      title: "API Access",
      description: "Use API to automate orders and integrate systems",
      icon: "fa-code",
      link: "/api-access",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Reseller Tools
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex gap-4 items-center"
            >
              <div className="bg-blue-100 text-blue-600 p-4 rounded-lg text-xl">
                <i className={`fa-solid ${item.icon}`} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h2>

                <p className="text-gray-500 text-sm">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reseller;
