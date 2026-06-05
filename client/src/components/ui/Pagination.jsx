export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 mb-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-gray-200 bg-white hover:border-[#c4622d] hover:bg-[#c4622d]/5 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 cursor-pointer"
      >
        ← Prev
      </button>

      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all border cursor-pointer
              ${
                isCurrent
                  ? "bg-[#c4622d] border-[#c4622d] text-white shadow-sm scale-105"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-gray-200 bg-white hover:border-[#c4622d] hover:bg-[#c4622d]/5 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 cursor-pointer"
      >
        Next →
      </button>
    </div>
  );
}
