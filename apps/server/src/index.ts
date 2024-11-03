import { Context, Effect, Exit, Layer, Logger, LogLevel } from "effect";
import {
  DrizzleMigrateServiceLive,
  EnvServiceLive,
  DrizzlePostgresProviderLive,
  EnvService,
} from "@billo-blog/core";
import runServer from "./fastify/index.js";

const program = Effect.scoped(
  Effect.gen(function* () {
    yield* runServer;
  })
);

const start = async () => {
  const layers = DrizzleMigrateServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        DrizzlePostgresProviderLive,
        Logger.pretty,
        EnvServiceLive.pipe(
          Layer.flatMap((ctx) => {
            const logLevel = ctx.pipe(Context.get(EnvService)).LOG_LEVEL;
            return Logger.minimumLogLevel(logLevel);
          })
        )
      )
    ),
    Layer.provideMerge(EnvServiceLive)
  );

  const runnable = Effect.scoped(Effect.provide(program, layers));
  const result = await Effect.runPromiseExit(runnable);
  if (Exit.isFailure(result)) {
    console.error(result.cause);
    process.exit(1);
  }
};

await start();
