import { BookJSchema } from "src/shared/schemas/BookJSchema";
import { ViewBookChunkHistoryJSchema } from "src/shared/schemas/ViewBookChunkHistoryJSchema";
import { SearchHistoryJSchema } from "../../shared/schemas/SearchHistoryJSchema";
import { COLLECTION_NAMES } from "./collectionNames";

export async function createDb() {
  if (typeof window === "undefined") {
    return undefined;
  } else {
    const [
      { createRxDatabase, addRxPlugin },
      { RxDBUpdatePlugin },
      { RxDBJsonDumpPlugin },
      { getRxStorageDexie },
    ] = await Promise.all([
      import("rxdb"),
      import("rxdb/plugins/update"),
      import("rxdb/plugins/json-dump"),
      import("rxdb/plugins/dexie"),
    ]);

    if (process.env.NODE_ENV !== "production") {
      const devModeModule = await import("rxdb/plugins/dev-mode");
      addRxPlugin(devModeModule.RxDBDevModePlugin);
    }

    addRxPlugin(RxDBUpdatePlugin);
    addRxPlugin(RxDBJsonDumpPlugin);

    const db = await createRxDatabase({
      name: "xxbook",
      storage: getRxStorageDexie(),
    });

    await db.addCollections({
      [COLLECTION_NAMES.book]: {
        schema: BookJSchema,
      },
      [COLLECTION_NAMES.searchHistory]: {
        schema: SearchHistoryJSchema,
      },
      [COLLECTION_NAMES.viewBookChunkHistory]: {
        schema: ViewBookChunkHistoryJSchema,
      },
    });

    return db;
  }
}
