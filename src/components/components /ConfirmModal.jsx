const ConfirmModal = ({ open, onClose, onConfirm, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[350px]">
        <p className="text-sm mb-4">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
