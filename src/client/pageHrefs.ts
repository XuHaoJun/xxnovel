import type { ParsedUrlQueryInput } from "node:querystring";
import type { Book, ISimpleBookChunk } from "src/shared/types/models";
import { ISearchBookBody } from "./services/book";

export function book(book: Pick<Book, "_index" | "id"> | undefined) {
  return `/books/${book?._index}/${book?.id}`;
}

export function bookChunk({
  book,
  simpleBookChunk,
}: {
  book: Book | undefined;
  simpleBookChunk: ISimpleBookChunk | undefined;
}): string {
  return `/bookchunks/${book?._index}/${book?.id}/${simpleBookChunk?.idxByCreatedAtAsc}`;
}

export function search(body: ISearchBookBody & ParsedUrlQueryInput) {
  const query: ParsedUrlQueryInput = body;
  return { pathname: "/search", query };
}
