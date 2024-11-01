import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Context, Effect, Layer, Scope } from "effect";
import postgres from "postgres";
import { EnvService } from "../../env/service.js";
export class DrizzlePostgresProvider extends Context.Tag("DrizzlePostgresProvider")() {
}
export const acquirePostgresClient = Effect.gen(function* () {
    const { POSTGRES_URL, POSTGRES_SSL_CERTIFICATE } = yield* EnvService;
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
export const releasePostgresClient = (client) => Effect.promise((signal) => client.end({ timeout: 1000 }));
export const DrizzlePostgresProviderLive = Layer.effect(DrizzlePostgresProvider, Effect.gen(function* () {
    const envService = yield* EnvService;
    const dbResource = Effect.acquireRelease(Effect.provideService(acquirePostgresClient, EnvService, envService), releasePostgresClient);
    return { dbResource };
}));
//# sourceMappingURL=provider.js.map