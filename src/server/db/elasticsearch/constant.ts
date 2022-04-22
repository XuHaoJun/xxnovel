export enum INDICES_NAMES {
  BookInfo = "bookinfo",
  BookChunk = "bookchunk",
}

export enum WRITE_INDICES_NAMES {
  BookInfo = "bookinfo-write",
  BookChunk = "bookchunk-write",
}

export enum SEARCH_INDICES_NAMES {
  BookInfo = "bookinfo-*",
  BookChunk = "bookchunk-*",
}

export enum INDICES_PREFIXS {
  BookInfo = `bookinfo-`,
  BookChunk = "bookchunk-",
}

export const TEXT_TOKENIZER = "white-space";
export const SPLITTER_TOKEN = " ";
