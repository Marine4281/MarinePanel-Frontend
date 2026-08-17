// src/components/api/ApiDocsTab.jsx
const ApiDocsTab = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <h3 className="text-lg font-semibold text-gray-800 mb-1">API Documentation Reference</h3>
    <p className="text-xs text-gray-400 mb-4">Read-only preview of what end users see at /api-docs</p>
    <iframe
      title="API Docs"
      src="/api-access"
      className="w-full h-[70vh] border border-gray-100 rounded-xl"
    />
  </div>
);

export default ApiDocsTab;
