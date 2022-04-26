import { useInfiniteQuery, useQuery } from "react-query";
import { Book } from "src/shared/types/models";
import {
  BOOK_QKEYS,
  getBook,
  getBookChunk,
  getLatestBooks,
} from "../services/book";

export const useBook = (bookIndex: string, bookId: string) => {
  const { data: book, ...queryOthers } = useQuery(
    BOOK_QKEYS.getBook(bookIndex, bookId),
    () => getBook(bookIndex, bookId)
  );
  return { book, queryOthers };
};

export const useLatestBooks = (page: number = 0) => {
  const size = 50;
  const offset = size * page;
  const limit = size;
  const { data: latestBooks, ...queryOthers } = useQuery(
    BOOK_QKEYS.getLatestBooks({ offset, limit }),
    () => getLatestBooks({ offset, limit }),
    { keepPreviousData: true }
  );
  return {
    latestBooks,
    queryOthers,
  };
};

export const useBookChunk = (bookId: string, idxByCreatedAtAsc: number) => {
  const { data: bookChunk, ...queryOthers } = useQuery(
    BOOK_QKEYS.getBookChunk(bookId, idxByCreatedAtAsc),
    () => getBookChunk(bookId, idxByCreatedAtAsc)
  );
  return { bookChunk, queryOthers };
};

export const NotFoundIdxByCreatedAtAscError = new Error(
  "not found idxByCreatedAtAsc"
);

export const useInfiniteBookChunks = (
  bookId: string,
  initIdxByCreatedAtAsc: number,
  book?: Book
) => {
  const { data, ...infiniteBookChunksQueryOthers } = useInfiniteQuery(
    BOOK_QKEYS.getInfiniteBookChunks(),
    ({ pageParam = initIdxByCreatedAtAsc }) => getBookChunk(bookId, pageParam),
    {
      enabled: Boolean(book),
      getNextPageParam: (lastPage, pages) => {
        if (typeof lastPage.idxByCreatedAtAsc !== "number") {
          throw NotFoundIdxByCreatedAtAscError;
        } else {
          const nextPage = lastPage.idxByCreatedAtAsc + 1;
          if (book?.chunks?.[nextPage]) {
            return nextPage;
          } else {
            throw NotFoundIdxByCreatedAtAscError;
          }
        }
      },
    }
  );

  return {
    bookChunks: data?.pages,
    infiniteBookChunksQueryOthers: { data, ...infiniteBookChunksQueryOthers },
  };
};
