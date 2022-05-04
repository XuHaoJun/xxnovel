import type { RxCollection } from "rxdb";

import type { Book, BookChunk } from "src/shared/types/models";
import type { IViewBookChunkHistoryData } from "src/shared/schemas/ViewBookChunkHistoryJSchema";
import moment from "moment";

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
      createdAt: new Date().toISOString(),
    };
  }

  public static async addOne(
    col: RxCollection<IViewBookChunkHistoryData>,
    vbchData: IViewBookChunkHistoryData
  ) {
    const old = await col
      .findOne({
        selector: {
          bookChunkId: vbchData.bookChunkId,
        },
      })
      .exec();

    // deduplicate in 1 day
    const now = moment();
    const isSameDay =
      old &&
      moment(now)
        .startOf("day")
        .diff(moment(old?.createdAt).endOf("day"), "days") < 1;
    if (isSameDay) {
      await old.update({ $set: { createdAt: vbchData.createdAt } });
    } else {
      await col.insert(vbchData);
      const docs = await col
        .find({
          selector: {},
          sort: [
            {
              createdAt: "desc",
            },
          ],
          skip: ViewBookChunkHistoryModel.MAX_SIZE,
        })
        .exec();

      if (docs.length > 0) {
        await col.bulkRemove(
          docs
            .filter((x) => typeof x.id === "string")
            .map((x) => x.id as string)
        );
      }
    }
  }
}
