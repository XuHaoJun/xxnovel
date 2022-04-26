import type {
  BookForClient,
  ISimpleBookChunk as IISimpleBookChunk,
} from "../../server/db/elasticsearch/models/book.model";

import type { BookChunkForClient } from "../../server/db/elasticsearch/models/bookChunk.model";

export type ISimpleBookChunk = IISimpleBookChunk;

export type Book = BookForClient;

export type BookChunk = BookChunkForClient;
