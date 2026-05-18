// src/components/admin/childpanel/settings/CPGuideRow.jsx

import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function CPGuideRow({ guide, onUpdate, onDelete }) {
  const [editing,   setEditing]   = useState(false);
  const [title,     setTitle]     = useState(guide.title);
  const [content,   setContent]   = useState(guide.content);
  const [placement, setPlacement] = useState(guide.placement);
  const [visible,   setVisible]   = useState(guide.visible);
  const [loading,   setLoading]   = useState(false);

  const save = async () => {
    setLoading(true);
    await onUpdate(guide._id, { title, content, placement, visible });
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="border rounded-xl p-3 bg-white space-y-2">
      {editing ? (
        <>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            placeholder="Title"
          />
          <textarea
            rows={3} value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none resize-none"
            placeholder="Content (markdown supported)"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={placement} onChange={(e) => setPlacement(e.target.value)}
              className="border rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="activation">Activation page</option>
              <option value="dashboard">Dashboard</option>
              <option value="both">Both</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox" checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              Visible
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-1 border rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save} disabled={loading}
              className="flex-1 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-800">{guide.title}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                guide.visible
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {guide.visible ? "Visible" : "Hidden"}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 capitalize">
                {guide.placement}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{guide.content}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-500"
            >
              <FiEdit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(guide._id)}
              className="p-1.5 text-gray-400 hover:text-red-500"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
