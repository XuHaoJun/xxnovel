import { useQuery } from "react-query";
import { getBook, getBookChunk, getGoodBookInfos } from "../services/book";

export const useBook = (bookId: string) => {
  const { data: book } = useQuery(["books", bookId], () => getBook(bookId));
  return { book };
};

export const useGoodBookInfos = () => {
  const { data: goodBookInfos } = useQuery(["books", "good"], () =>
    getGoodBookInfos()
  );
  return {
    goodBookInfos,
  };
};

export const useBookChunk = ({
  bookId,
  bookChunkId,
}: {
  bookId: string;
  bookChunkId: string;
}) => {
  const { book } = useBook(bookId);

  const { data: bookChunk } = useQuery(
    ["books", bookId, "chunks", bookChunkId],
    () => getBookChunk(bookId, bookChunkId)
  );

  return { book, bookChunk };
};
