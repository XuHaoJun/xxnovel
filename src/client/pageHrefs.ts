import type { ParsedUrlQueryInput } from "node:querystring";
import type { Book, ISimpleBookChunk } from "src/shared/types/models";
import { ISearchBookBody } from "./services/book";

export function book(book: Pick<Book, "esIndex" | "id"> | undefined) {
  return `/books/${book?.esIndex}/${book?.id}`;
}

export function bookChunk({
  book,
  simpleBookChunk,
}: {
  book: Book | undefined;
  simpleBookChunk: ISimpleBookChunk | undefined;
}): string {
  return `/bookchunks/${book?.esIndex}/${book?.id}/${simpleBookChunk?.idxByCreatedAtAsc}`;
}

export function search(body: ISearchBookBody & ParsedUrlQueryInput) {
  const query: ParsedUrlQueryInput = body;
  return { pathname: "/search", query };
}
