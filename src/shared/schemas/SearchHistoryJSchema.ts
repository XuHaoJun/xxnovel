import type { RxDocument, RxJsonSchema } from "rxdb";

export interface ISearchHistoryData {
  id?: string;
  text?: string;
  createdAt?: Date;
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
      minLength: 1,
    },
    createdAt: {
      type: "date-time",
    },
  },
  required: ["id", "createdAt"],
  indexes: ["createdAt"],
} as const;
