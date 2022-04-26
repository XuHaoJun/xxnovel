import { Book, ISimpleBookChunk } from "src/shared/types/models";

export function book(book: Book | undefined) {
  return `books/${book?._index}/${book?.id}`;
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
