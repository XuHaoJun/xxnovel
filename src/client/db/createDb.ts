import { SearchHistoryJSchema } from "../../shared/schemas/SearchHistoryJSchema";
import { COLLECTION_NAMES } from "./collectionNames";

export async function createDb() {
  if (typeof window === "undefined") {
    return undefined;
  } else {
    const createRxDatabase = (await import("rxdb")).createRxDatabase;
    const { getRxStoragePouch, addPouchPlugin } = await import(
      "rxdb/plugins/pouchdb"
    );

    addPouchPlugin((await import("pouchdb-adapter-idb")).default);

    const db = await createRxDatabase({
      name: "xxbook",
      storage: getRxStoragePouch("idb"),
    });

    db.addCollections({
      [COLLECTION_NAMES.searchHistory]: {
        schema: SearchHistoryJSchema,
      },
    });

    return db;
  }
}
