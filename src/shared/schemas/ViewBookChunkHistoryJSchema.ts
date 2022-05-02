import type { RxDocument, RxJsonSchema } from "rxdb";
import { COLLECTION_NAMES } from "src/client/db/collectionNames";

export interface IViewBookChunkHistoryData {
  id?: string;
  bookChunkIdxByCreatedAt?: number;
  bookChunkId?: string;
  bookChunkIndex?: string;
  bookId?: string;
  bookIndex?: string;
  createdAt?: Date;
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
    },
    bookChunkIndex: {
      type: "string",
    },
    bookId: {
      type: "string",
      ref: COLLECTION_NAMES.book,
    },
    bookIndex: {
      type: "string",
    },
    createdAt: {
      type: "date-time",
    },
  },
  required: [
    "id",
    "bookId",
    "bookIndex",
    "bookChunkIdxByCreatedAt",
    "bookChunkInfo",
    "createdAt",
  ],
  indexes: ["createdAt"],
} as const;
