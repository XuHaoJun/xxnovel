import type { RxCollection } from "rxdb";

import type { Book, BookChunk } from "src/shared/types/models";
import type { IViewBookChunkHistoryData } from "src/shared/schemas/ViewBookChunkHistoryJSchema";

export class ViewBookChunkHistoryModel {
  public static readonly MAX_SIZE = 50;

  public static async createData(
    book: Book,
    bookChunk: BookChunk
  ): Promise<IViewBookChunkHistoryData> {
    const BSON = await import("bson");
    return {
      id: new BSON.ObjectId().toString(),
      bookChunkIdxByCreatedAt: bookChunk.idxByCreatedAtAsc,
      bookChunkId: bookChunk.id,
      bookChunkIndex: bookChunk._index,
      bookId: book.id,
      bookIndex: book.esIndex,
      createdAt: new Date(),
    };
  }

  public static async addOne(
    col: RxCollection<IViewBookChunkHistoryData>,
    vbchData: IViewBookChunkHistoryData
  ) {
    await col.insert(vbchData);
    const docs = await col
      .find({
        selector: {},
        sort: [
          {
            createdAt: "desc",
          },
        ],
      })
      .exec();
    if (docs.length > ViewBookChunkHistoryModel.MAX_SIZE) {
      await col.bulkRemove(
        docs
          .slice(ViewBookChunkHistoryModel.MAX_SIZE + 1, docs.length)
          .map((x) => x.id as string)
      );
    }
  }
}
