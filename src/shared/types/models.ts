import type { BookForClient } from "../../server/db/elasticsearch/models/book.model";
import type { BookChunkForClient } from "../../server/db/elasticsearch/models/bookChunk.model";

export type Book = BookForClient;

export type BookChunk = BookChunkForClient;
