import type { Book, ISimpleBookChunk } from "src/shared/types/models";

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

export function search(q: string) {
  return { pathname: "/search", query: { q: q } };
}
