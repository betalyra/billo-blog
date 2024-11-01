import * as migrator from "drizzle-orm/postgres-js/migrator";
import { Context, Effect, Layer } from "effect";
import { DrizzlePostgresProvider } from "./provider.js";
import { EnvService } from "../../env/service.js";
import { drizzle } from "drizzle-orm/postgres-js";
export class DrizzleMigrateService extends Context.Tag("DrizzleMigrateService")() {
}
export const DrizzleMigrateServiceLive = Layer.effect(DrizzleMigrateService, Effect.gen(function* () {
    const dbResource = yield* DrizzlePostgresProvider;
    const db = yield* dbResource.dbResource;
    const drizzleClient = drizzle(db);
    const { MIGRATIONS_FOLDER } = yield* EnvService;
    const migrate = Effect.tryPromise(async () => {
        await migrator.migrate(drizzleClient, {
            migrationsFolder: MIGRATIONS_FOLDER,
        });
    });
    return { migrate };
}));
//# sourceMappingURL=migrate.js.map