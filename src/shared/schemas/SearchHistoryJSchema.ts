import type { RxDocument, RxJsonSchema } from "rxdb";

export interface ISearchHistoryData {
  id?: string;
  text?: string;
  createdAt?: string;
}

export type ISearchHistoryDocument = RxDocument<ISearchHistoryData>;

export const SearchHistoryJSchema: RxJsonSchema<any> = {
  title: "search history",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    text: {
      type: "string",
      maxLength: 100,
    },
    createdAt: {
      type: 'string',
      format: "date-time",
      maxLength: 100,
    },
  },
  required: ["id", "createdAt", "text"],
  indexes: ["createdAt", "text"],
} as const;
