import type { RxDocument } from "rxdb";

export interface ISearchHistoryData {
  id?: string;
  text?: string;
  createdAt?: Date;
}

export type ISearchHistoryDocument = RxDocument<ISearchHistoryData>;

export const SearchHistoryJSchema = {
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
  required: ["id"],
  indexes: ["createdAt"],
} as const;
