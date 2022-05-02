import { useInfiniteQuery, useQuery } from "react-query";
import { Book } from "src/shared/types/models";
import {
  BOOK_QKEYS,
  getBook,
  getBookChunk,
  getBookTitleSuggests,
  getLatestBooks,
  searchBook,
  ISearchBookBody,
} from "../services/book";

export const useBook = (bookIndex: string, bookId: string) => {
  const { data: book, ...queryOthers } = useQuery(
    BOOK_QKEYS.getBook(bookIndex, bookId),
    () => getBook(bookIndex, bookId)
  );
  return { book, queryOthers };
};

export const useLatestBooks = (page: number = 0) => {
  const size = 100;
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
          return undefined;
        } else {
          const nextPage = lastPage.idxByCreatedAtAsc + 1;
          if (book?.chunks?.[nextPage]) {
            return nextPage;
          } else {
            return undefined;
          }
        }
      },
      retry: 1,
    }
  );

  return {
    bookChunks: data?.pages,
    infiniteBookChunksQueryOthers: { data, ...infiniteBookChunksQueryOthers },
  };
};

export const useBookTitleSuggests = (prefix: string) => {
  const { data, ...queryOthers } = useQuery(
    BOOK_QKEYS.getBookTitleSuggests(prefix),
    () => getBookTitleSuggests(prefix),
    {
      enabled: prefix.length > 0,
    }
  );
  return { bookTitleSuggests: data || [], queryOthers };
};

export const useSearchBook = (body: ISearchBookBody) => {
  const { data, ...queryOthers } = useQuery(
    BOOK_QKEYS.searchBook(body),
    () => searchBook(body),
    {
      enabled: body.text.length > 0,
    }
  );
  return { bookSearchResult: data, queryOthers };
};
