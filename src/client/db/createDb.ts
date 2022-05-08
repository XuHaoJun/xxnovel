import { BookJSchema } from "src/shared/schemas/BookJSchema";
import { ViewBookChunkHistoryJSchema } from "src/shared/schemas/ViewBookChunkHistoryJSchema";
import { SearchHistoryJSchema } from "../../shared/schemas/SearchHistoryJSchema";
import { COLLECTION_NAMES } from "./collectionNames";

declare const module: any;

export async function createDb() {
  if (typeof window === "undefined") {
    return undefined;
  } else {
    const [
      { createRxDatabase, addRxPlugin },
      { RxDBUpdatePlugin },
      { RxDBJsonDumpPlugin },
      { getRxStorageDexie },
      { RxDBMigrationPlugin },
    ] = await Promise.all([
      import("rxdb/plugins/core"),
      import("rxdb/plugins/update"),
      import("rxdb/plugins/json-dump"),
      import("rxdb/plugins/dexie"),
      import("rxdb/plugins/migration"),
    ]);

    // if (process.env.NODE_ENV !== "production") {
    //   const devModeModule = await import("rxdb/plugins/dev-mode");
    //   if (!module.hot?.data?.isAddDevModeModule) {
    //     addRxPlugin(devModeModule.RxDBDevModePlugin);
    //   }
    //   if (module.hot) {
    //     module.hot.dispose((data: any) => {
    //       data.isAddDevModeModule = true;
    //     });
    //   }
    // }

    addRxPlugin(RxDBUpdatePlugin);
    addRxPlugin(RxDBJsonDumpPlugin);
    addRxPlugin(RxDBMigrationPlugin);

    const db = await createRxDatabase({
      name: "xxbook",
      storage: getRxStorageDexie(),
    });

    const migrateRemoveDoc = () => null;
    await db.addCollections({
      [COLLECTION_NAMES.book]: {
        schema: BookJSchema,
        migrationStrategies: {
          1: migrateRemoveDoc,
        },
      },
      [COLLECTION_NAMES.searchHistory]: {
        schema: SearchHistoryJSchema,
        migrationStrategies: {
          1: migrateRemoveDoc,
        },
      },
      [COLLECTION_NAMES.viewBookChunkHistory]: {
        schema: ViewBookChunkHistoryJSchema,
        migrationStrategies: {
          1: migrateRemoveDoc,
        },
      },
    });

    return db;
  }
}
