import { Button, cn } from '@blms/ui';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="ghost"
        size="s"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-black hover:text-orange-400 px-2"
      >
        <TbChevronLeft size={20} />
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index === 1 ? 'start' : 'end'}`}
                className="px-2 text-neutral-500"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'size-10 py-2 px-3 flex items-center justify-center rounded-lg body-small-bold transition-colors',
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-900 hover:bg-neutral-50',
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="s"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-black hover:text-orange-400 px-2"
      >
        <TbChevronRight size={20} />
      </Button>
    </div>
  );
};
