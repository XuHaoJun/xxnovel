import { useQuery } from "react-query";
import { getBook, getBookChunk, getBookChunkInfos } from "../services/book";

export const useBook = (bookId: string) => {
  const { data: book } = useQuery(["books", bookId, "chunk-infos"], () =>
    getBook(bookId)
  );

  const { data: bookChunkInfos } = useQuery(
    ["books", bookId, "chunk-infos"],
    () => getBookChunkInfos(bookId),
    {
      enabled: book?.id,
    }
  );
};

export const useBookChunk = (bookId: string, bookChunkId: string) => {
  const { data: book } = useQuery(["books", bookId], () => getBook(bookId));

  const { data: bookChunk } = useQuery(
    ["book", bookId, "chunks", bookChunkId],
    () => getBookChunk(bookId, bookChunkId),
    {
      enabled: book?.id,
    }
  );
};