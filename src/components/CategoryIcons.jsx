// src/components/CategoryIcons.jsx
import React from "react";
import getPlatformIcon from "../utils/getPlatformIcon";

const CategoryIcons = ({ categoriesGrid, selectedPlatform, setSelectedPlatform }) => {
  return (
    <div className="mb-6">

      {/* Header */}
      <h2 className="bg-gray-100 p-2 rounded-xl font-bold text-lg text-center mb-2">
        Choose a Social Account
      </h2>

      {/* Icons Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {categoriesGrid.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedPlatform(cat.name)}
            className={`
              bg-white rounded-2xl p-2 shadow flex flex-col items-center justify-center gap-1
              transition-all duration-200
              hover:scale-105 hover:ring-2 hover:ring-green-400
              ${selectedPlatform === cat.name ? "ring-2 ring-green-500 scale-105" : ""}
            `}
          >
            {/* Icon */}
            <div className="text-2xl">{getPlatformIcon(cat.icon)}</div>

            {/* Name */}
            <span className="text-sm font-semibold text-center">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryIcons;
