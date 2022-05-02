import { SearchHistoryJSchema } from "../../shared/schemas/SearchHistoryJSchema";
import { COLLECTION_NAMES } from "./collectionNames";

export async function createDb() {
  if (typeof window === "undefined") {
    return undefined;
  } else {
    const [
      { createRxDatabase, addRxPlugin },
      { getRxStoragePouch, addPouchPlugin },
      pouchIdbModule,
      { RxDBUpdatePlugin },
    ] = await Promise.all([
      import("rxdb"),
      import("rxdb/plugins/pouchdb"),
      import("pouchdb-adapter-idb"),
      import("rxdb/plugins/update"),
    ]);

    addRxPlugin(RxDBUpdatePlugin);
    addPouchPlugin(pouchIdbModule.default);

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
