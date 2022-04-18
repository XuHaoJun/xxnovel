import { getApiHttpClient } from "../../shared/utils/getHttpClient";

const hc = getApiHttpClient();

export async function getBook(bookId: string): Promise<any> {
  return (await hc.get(`books/${bookId}`)).data;
}

export async function getGoodBookInfos(): Promise<any> {
  // return [];
  return (await hc.get(`books/goods`)).data;
}

export async function getBookChunkInfos(bookId: string): Promise<any> {
  return (await hc.get(`books/${bookId}/chunkInfos`)).data;
}

export async function getBookChunk(
  bookId: string,
  bookChunkId: string
): Promise<any> {
  return new Date().toISOString();
  return (await hc.get(`books/${bookId}/chunks/${bookChunkId}`)).data;
}

export async function importBook(bookId: string): Promise<any> {
  return (await hc.post(`books/${bookId}/import`)).data;
}
