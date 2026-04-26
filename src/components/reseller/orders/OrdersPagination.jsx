const OrdersPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  ordersPerPage,
  setOrdersPerPage,
}) => {
  return (
    <div className="flex justify-between items-center mt-4 flex-wrap gap-3">
      <select
        value={ordersPerPage}
        onChange={(e) => setOrdersPerPage(Number(e.target.value))}
        className="border px-2 py-1 rounded"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrdersPagination;
