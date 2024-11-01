import { Effect, Exit, Layer, Logger, LogLevel } from "effect";
import {
  DrizzleMigrateServiceLive,
  EnvServiceLive,
  DrizzlePostgresProviderLive,
  DrizzleMigrateService,
} from "@billo-blog/core";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("🚚 Starting migration");
  const migrateService = yield* DrizzleMigrateService;
  yield* migrateService.migrate;
  yield* Effect.logInfo("✅ Migration completed");
});

const run = async () => {
  const layers = DrizzleMigrateServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(DrizzlePostgresProviderLive, Logger.pretty)
    ),
    Layer.provide(EnvServiceLive)
  );

  const runnable = Effect.scoped(
    Effect.provide(
      program.pipe(Logger.withMinimumLogLevel(LogLevel.Info)),
      layers
    )
  );
  const result = await Effect.runPromiseExit(runnable);
  if (Exit.isFailure(result)) {
    console.error(result.cause);
    process.exit(1);
  }
};

await run();
