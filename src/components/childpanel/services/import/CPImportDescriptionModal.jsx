// src/components/childpanel/services/import/CPImportDescriptionModal.jsx
import { FiX, FiInfo } from "react-icons/fi";

export default function CPImportDescriptionModal({ text, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FiInfo size={16} className="text-blue-500" /> Service Description
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {text || "No description available."}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
