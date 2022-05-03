import type { RxDocument, RxJsonSchema } from "rxdb";
import type { Book, ISimpleBookChunk } from "../types/models";

export interface IBookData extends Book {}

export type IBookDocument = RxDocument<IBookData>;

export const BookJSchema: RxJsonSchema<any> = {
  title: "book id",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    esIndex: {
      type: "string",
    },
    title: {
      type: "string",
    },
    authorName: {
      type: "string",
    },
    // createdAt: {
    //   type: "date-time",
    // },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
    importedAt: {
      type: "string",
      format: "date-time",
    },
    category: {
      type: "string",
    },
    status: {
      type: "string",
    },
    numChar: {
      type: "integer",
    },
    descriptionLines: {
      type: "array",
      items: {
        type: "string",
      },
    },
    chunks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          esIndex: {
            type: "string",
          },
          id: {
            type: "string",
          },
          idxByCreatedAtAsc: {
            type: "integer",
          },
        },
      },
    },
  },
  required: ["id"],
  indexes: [
    // "createdAt",
    // "updatedAt",
    // ['bookId', ''],
    // "category",
    // "title",
    // "authorName",
    // "esIndex",
    // "status",
  ],
} as const;
