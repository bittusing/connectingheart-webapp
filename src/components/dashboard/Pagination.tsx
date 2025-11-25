type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5]
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
    }

    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
  }

  const visiblePages = getVisiblePages()
  const showFirstPage = visiblePages[0] > 1
  const showLastPage = totalPages > visiblePages[visiblePages.length - 1]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 transition hover:border-pink-200 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        {showFirstPage && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`h-9 w-9 rounded-full transition ${
                1 === currentPage
                  ? 'bg-pink-500 font-semibold text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="px-2 text-slate-400">…</span>}
          </>
        )}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-9 w-9 rounded-full transition ${
              page === currentPage
                ? 'bg-pink-500 font-semibold text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {page}
          </button>
        ))}
        {showLastPage && (
          <>
            {totalPages > visiblePages[visiblePages.length - 1] + 1 && (
              <span className="px-2 text-slate-400">…</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`h-9 w-9 rounded-full transition ${
                totalPages === currentPage
                  ? 'bg-pink-500 font-semibold text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 transition hover:border-pink-200 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
      >
        Next
      </button>
    </div>
  )
}

