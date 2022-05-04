import type { RxCollection } from "rxdb";
import type {
  ISearchHistoryData,
  ISearchHistoryDocument,
} from "src/shared/schemas/SearchHistoryJSchema";

// move to rxdb methods?
export class SearchHistoryModel {
  public static readonly MAX_SIZE = 50;

  public static async createData(text: string): Promise<ISearchHistoryData> {
    const BSON = await import("bson");
    return {
      id: new BSON.ObjectId().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
  }

  public static async updateCreatedAt(
    doc: ISearchHistoryDocument,
    createdAt?: Date
  ) {
    return doc.update({
      $set: {
        createdAt: createdAt || new Date().toISOString(),
      },
    });
  }

  public static async addOne(
    shCol: RxCollection<ISearchHistoryData>,
    newdDoc: ISearchHistoryData
  ): Promise<void> {
    await shCol
      .find({
        selector: {
          text: newdDoc.text,
        },
      })
      .remove();
    await shCol.insert(newdDoc);
    const docs = await shCol
      .find({
        selector: {},
        sort: [
          {
            createdAt: "desc",
          },
        ],
        skip: SearchHistoryModel.MAX_SIZE,
      })
      .exec();

    if (docs.length > 0) {
      await shCol.bulkRemove(
        docs
          .slice(SearchHistoryModel.MAX_SIZE + 1, docs.length)
          .map((x) => x.id as string)
      );
    }
  }

  public static async removeOne(
    shCol: RxCollection<ISearchHistoryData>,
    id: string
  ) {
    return shCol
      .findOne({
        selector: {
          id,
        },
      })
      ?.remove();
  }
}
