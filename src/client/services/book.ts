import JSONStringify from "fast-safe-stringify";

import { getApiHttpClient } from "../../shared/utils/getHttpClient";
import type { Book, BookChunk } from "../../shared/types/models";
import {
  IPaginationResponse,
  IQueryPaginationRange,
} from "src/shared/types/apiResponse";

const axios = getApiHttpClient();

const ROUTE_PATHS = {
  getBook: (bookIndex: string, bookId: string) =>
    `books/indices/${bookIndex}/${bookId}`,
  searchBook: () => `books/search`,
  getLatestBooks: () => `books/latests`,
  getBookChunk: (bookId: string, idxByCreatedAtAsc: number) =>
    `books/ids/${bookId}/chunks-by-idxs/${idxByCreatedAtAsc}`,
  getBookTitleSuggests: () => `books/title-suggests`,
  getFullBookThumbUrl: (bookIndex: string, bookId: string) =>
    `/api/books/indices/${bookIndex}/${bookId}/thumb`,
};

export const BOOK_ROUTE_PATHS = ROUTE_PATHS;

export const BOOK_QKEYS = {
  getBook: (bookIndex: string, bookId: string) => [
    ROUTE_PATHS.getBook(bookIndex, bookId),
  ],
  searchBook: (body: ISearchBookBody) => [
    ROUTE_PATHS.searchBook(),
    JSONStringify.stable(body),
  ],
  getLatestBooks: (params?: IQueryPaginationRange) => [
    ROUTE_PATHS.getLatestBooks(),
    JSONStringify.stable(params),
  ],
  getBookChunk: (bookId: string, idxByCreatedAtAsc: number) => [
    ROUTE_PATHS.getBookChunk(bookId, idxByCreatedAtAsc),
  ],
  getInfiniteBookChunks: () => ["infiniteBookChunks"],
  getBookTitleSuggests: (prefix: string) => [
    ROUTE_PATHS.getBookTitleSuggests(),
    prefix,
  ],
};

export interface ISearchBookBody {
  text: string;
  categories?: Array<string>;
}

export interface ISearchBookResponseBody {}

export async function searchBook(
  body: ISearchBookBody
): Promise<IPaginationResponse<Book>> {
  return (await axios.post(ROUTE_PATHS.searchBook(), body)).data;
}

export async function getBook(
  bookIndex: string,
  bookId: string
): Promise<Book> {
  return (await axios.get(ROUTE_PATHS.getBook(bookIndex, bookId))).data;
}

export async function getLatestBooks(
  params?: IQueryPaginationRange
): Promise<IPaginationResponse<Book>> {
  return (await axios.get(ROUTE_PATHS.getLatestBooks(), { params })).data;
}

export async function getBookChunk(
  bookId: string,
  idxByCreatedAtAsc: number
): Promise<BookChunk> {
  return (await axios.get(ROUTE_PATHS.getBookChunk(bookId, idxByCreatedAtAsc)))
    .data;
}

export async function getBookTitleSuggests(
  prefix: string
): Promise<Array<Book>> {
  return (
    await axios.get(ROUTE_PATHS.getBookTitleSuggests(), {
      params: { prefix },
    })
  ).data;
}
