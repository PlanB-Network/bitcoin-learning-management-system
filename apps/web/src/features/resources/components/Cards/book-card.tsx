import { Link } from '@tanstack/react-router';

import type { JoinedBook } from '@sovereign-university/types';

interface BookCardProps {
  book: JoinedBook;
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link
      to={'/resources/book/$bookId'}
      params={{
        bookId: book.id.toString(),
      }}
    >
      <div className="group flex flex-col gap-4 p-3 hover:bg-newOrange-1 rounded-2xl hover:z-10 hover:scale-110 transition-all duration-300">
        <img
          className="object-contain group-hover:rounded-2xl transition-all duration-300"
          src={book.cover}
          alt={book.title}
        />
        <span className="text-white text-xl leading-5 font-medium">
          {book.title}
        </span>
        <span className="text-white leading-6">
          {book.author}
          {book.publicationYear && (
            <>
              <span> · </span>
              <span className="text-white/75 font-light">
                {book.publicationYear}
              </span>
            </>
          )}
        </span>
      </div>
    </Link>
  );
};
