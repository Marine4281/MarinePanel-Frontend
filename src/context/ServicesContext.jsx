import { createContext, useContext, useEffect, useState, useMemo } from "react";
import API from "../api/axios";

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Services (Always Fresh)
  // =========================
  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      const data = res.data || [];
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // =========================
  // Memoized Derived Data
  // =========================
  const platforms = useMemo(() => {
    return [...new Set(services.map((s) => s.platform))];
  }, [services]);

  const getCategoriesByPlatform = (platform) => {
    return [
      ...new Set(
        services
          .filter((s) => s.platform === platform)
          .map((s) => s.category)
      ),
    ];
  };

  const getServicesByCategory = (platform, category) => {
    return services.filter(
      (s) => s.platform === platform && s.category === category
    );
  };

  const getGlobalDefault = () => {
    return services.find((s) => s.isDefaultCategoryGlobal);
  };

  const getPlatformDefault = (platform) => {
    return services.find(
      (s) => s.platform === platform && s.isDefaultCategoryPlatform
    );
  };

  const refreshServices = async () => {
    await fetchServices();
  };

  return (
    <ServicesContext.Provider
      value={{
        services,
        loading,
        platforms,
        getCategoriesByPlatform,
        getServicesByCategory,
        getGlobalDefault,
        getPlatformDefault,
        refreshServices,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => useContext(ServicesContext);
