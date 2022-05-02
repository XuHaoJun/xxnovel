import type { RxCollection, RxDocument } from "rxdb";
import { IBookData } from "src/shared/schemas/BookJSchema";

// move to rxdb methods?
export class BookModel {
  public static async addOne(
    shCol: RxCollection<IBookData>,
    newdDoc: IBookData
  ) {
    await shCol.upsert(newdDoc);
  }
}
