import type { RxDocument, RxJsonSchema } from "rxdb";
import { COLLECTION_NAMES } from "src/client/db/collectionNames";

export interface IViewBookChunkHistoryData {
  id?: string;
  bookChunkIdxByCreatedAt?: number;
  bookChunkId?: string;
  bookChunkIndex?: string;
  bookId?: string;
  bookIndex?: string;
  createdAt?: string;
}

export type IViewBookChunkHistoryDocument =
  RxDocument<IViewBookChunkHistoryData>;

export const ViewBookChunkHistoryJSchema: RxJsonSchema<any> = {
  title: "view book chunk history",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    bookChunkIdxByCreatedAt: {
      type: "number",
    },
    bookChunkId: {
      type: "string",
      maxLength: 100,
    },
    bookChunkIndex: {
      type: "string",
      maxLength: 100,
    },
    bookId: {
      type: "string",
      ref: COLLECTION_NAMES.book,
      maxLength: 100,
    },
    bookIndex: {
      type: "string",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      maxLength: 100,
    },
  },
  required: [
    "id",
    "bookId",
    "bookIndex",
    "bookChunkId",
    "bookChunkIdxByCreatedAt",
    "createdAt",
  ],
  indexes: ["createdAt", "bookChunkId"],
} as const;
