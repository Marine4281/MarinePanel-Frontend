import { FiX } from "react-icons/fi";

const DescriptionModal = ({ description, onClose }) => {
  if (!description) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[400px] relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <FiX />
        </button>

        <p>{description}</p>
      </div>
    </div>
  );
};

export default DescriptionModal;
