import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Context, Effect, Layer, Scope } from "effect";
import postgres from "postgres";
import { EnvService } from "../../env/service.js";

export type IDrizzlePostgresProvider = {
  postgresDrizzle: PostgresJsDatabase<Record<string, never>>;
};

export class DrizzlePostgresProvider extends Context.Tag(
  "DrizzlePostgresProvider"
)<DrizzlePostgresProvider, IDrizzlePostgresProvider>() {}

export const acquirePostgresClient: Effect.Effect<
  postgres.Sql<{}>,
  never,
  EnvService
> = Effect.gen(function* () {
  const { POSTGRES_URL, POSTGRES_SSL_CERTIFICATE } = yield* EnvService;
  yield* Effect.logDebug(`Acquiring postgres client`);
  const client = postgres(POSTGRES_URL, {
    // max: 1,
    ssl: POSTGRES_SSL_CERTIFICATE
      ? {
          mode: "verify-ca",
          sslrootcert: Buffer.from(POSTGRES_SSL_CERTIFICATE, "base64"),
          rejectUnauthorized: false,
        }
      : false,
  });

  return client;
});
export const releasePostgresClient: (
  client: postgres.Sql<{}>
) => Effect.Effect<void, never, never> = (client: postgres.Sql<{}>) =>
  Effect.gen(function* () {
    yield* Effect.logDebug(`Releasing postgres client`);
    yield* Effect.promise((signal) => client.end({ timeout: 1000 }));
  });

export const usePostgresClient = (client: postgres.Sql<{}>) =>
  Effect.gen(function* () {
    const db = drizzle(client);
    return { postgresDrizzle: db };
  });

const resource = Effect.acquireRelease(
  acquirePostgresClient,
  releasePostgresClient
);
export const DrizzlePostgresProviderLive = Layer.effect(
  DrizzlePostgresProvider,

  Effect.gen(function* () {
    const postgres = yield* resource;
    yield* Effect.logInfo(`☔️ Creating postgres drizzle...`);
    const postgresDrizzle: IDrizzlePostgresProvider["postgresDrizzle"] =
      drizzle(postgres, {
        casing: "snake_case",
      });

    return { postgresDrizzle };
  })
);
