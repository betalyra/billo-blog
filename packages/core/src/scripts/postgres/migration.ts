import { Effect, Exit, Layer, Logger, LogLevel } from "effect";
import { DrizzleMigrateServiceLive } from "../../services/db/postgres/migrate.js";
import { DrizzleMigrateService } from "../../services/db/postgres/migrate.js";
import { DrizzlePostgresProviderLive } from "../../services/db/postgres/provider.js";
import { EnvServiceLive } from "../../services/env/service.js";

const program = Effect.scoped(
  Effect.gen(function* () {
    yield* Effect.logInfo("🚚 Starting migration");
    const migrateService = yield* DrizzleMigrateService;
    yield* migrateService.migrate;
    yield* Effect.logInfo("✅ Migration completed");
  })
);

const run = async () => {
  const layers = DrizzleMigrateServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        DrizzlePostgresProviderLive,
        Logger.pretty,
        Logger.minimumLogLevel(LogLevel.Info)
      )
    ),
    Layer.provide(EnvServiceLive)
  );

  const runnable = Effect.scoped(Effect.provide(program, layers));
  const result = await Effect.runPromiseExit(runnable);
  if (Exit.isFailure(result)) {
    console.error(result.cause);
    process.exit(1);
  }
};

await run();
