const CategoryHeader = ({
  category,
  items,
  toggleSelectCategory,
  children,
}) => {
  return (
    <>
      {/* 📦 CATEGORY ROW */}
      <tr className="bg-gray-200">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            onChange={() => toggleSelectCategory(items)}
          />
        </td>

        <td colSpan="9" className="px-4 py-3 font-bold">
          📦 {category} ({items.length})
        </td>
      </tr>

      {/* 👇 CHILD ROWS (ServiceRow) */}
      {children}
    </>
  );
};

export default CategoryHeader;
