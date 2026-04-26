// src/components/reseller/orders/OrdersPagination.jsx

const OrdersPagination = ({
  currentPage = 1,
  totalPages = 1,
  setCurrentPage = () => {},
  ordersPerPage = 10,
  setOrdersPerPage = () => {},
}) => {
  const goPrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
      
      {/* PAGE SIZE */}
      <select
        value={ordersPerPage}
        onChange={(e) => {
          setOrdersPerPage(Number(e.target.value));
          setCurrentPage(1); // reset page when page size changes
        }}
        className="border px-2 py-1 rounded"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={goPrev}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={goNext}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrdersPagination;
