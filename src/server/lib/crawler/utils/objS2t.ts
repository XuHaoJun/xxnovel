import produce from "immer";
import _ from "lodash";

import { IBook, IBookChunk } from "../interfaces/Book";
import convertToZhTw2 from "./convertToZhTw2";
import { Paths } from "../../pathsType";

export async function bookInfo(bookInfo: IBook): Promise<IBook> {
  return await produce(bookInfo, async (draft: IBook) => {
    const strFileds: Array<
      Paths<Pick<IBook, "title" | "authorName" | "category" | "status">>
    > = ["title", "authorName", "category", "status"];
    for (const x of strFileds) {
      const v = draft[x];
      if (v) {
        const nextValue = (await convertToZhTw2(v)) as string;
        draft[x] = nextValue;
      }
    }
    if (_.isArray(draft.descriptionLines)) {
      draft.descriptionLines = (await convertToZhTw2(
        draft.descriptionLines
      )) as Array<string>;
    }
  });
}

export async function bookChunk(bookInfo: IBookChunk): Promise<IBookChunk> {
  return produce(bookInfo, async (draft: IBookChunk) => {
    const strFileds: Array<
      Paths<Pick<IBookChunk, "chapterName" | "sectionName">>
    > = ["chapterName", "sectionName"];
    for (const x of strFileds) {
      const v = draft[x];
      if (v) {
        draft[x] = (await convertToZhTw2(v)) as string;
      }
    }
    if (_.isArray(draft.contentLines)) {
      draft.contentLines = (await convertToZhTw2(
        draft.contentLines
      )) as Array<string>;
    }
  });
}
