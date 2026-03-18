// src/components/CategoryIcons.jsx
import React from "react";
import getPlatformIcon from "../utils/getPlatformIcon";
import { useServices } from "../context/ServicesContext"; // or CachedServicesContext

const CategoryIcons = ({ selectedPlatform, setSelectedPlatform }) => {
  const { platforms } = useServices(); // dynamically get platforms

  return (
    <div className="mb-6">
      {/* Header */}
      <h2 className="bg-gray-100 p-2 rounded-xl font-bold text-lg text-center mb-2">
        Choose a Social Account
      </h2>

      {/* Icons Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`
              bg-white rounded-2xl p-2 shadow flex flex-col items-center justify-center gap-1
              transition-all duration-200
              hover:scale-105 hover:ring-2 hover:ring-green-400
              ${selectedPlatform === platform ? "ring-2 ring-green-500 scale-105" : ""}
            `}
          >
            {/* Icon */}
            <div className="text-2xl">{getPlatformIcon(platform)}</div>

            {/* Name */}
            <span className="text-sm font-semibold text-center">{platform}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryIcons;
