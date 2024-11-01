import { Context, Effect, Layer, Scope } from "effect";
import postgres from "postgres";
import { EnvService } from "../../env/service.js";
export type IDrizzlePostgresProvider = {
    dbResource: Effect.Effect<postgres.Sql<{}>, Error, Scope.Scope>;
};
declare const DrizzlePostgresProvider_base: Context.TagClass<DrizzlePostgresProvider, "DrizzlePostgresProvider", IDrizzlePostgresProvider>;
export declare class DrizzlePostgresProvider extends DrizzlePostgresProvider_base {
}
export declare const acquirePostgresClient: Effect.Effect<postgres.Sql<{}>, never, EnvService>;
export declare const releasePostgresClient: (client: postgres.Sql<{}>) => Effect.Effect<void, never, never>;
export declare const DrizzlePostgresProviderLive: Layer.Layer<DrizzlePostgresProvider, never, EnvService>;
export {};
//# sourceMappingURL=provider.d.ts.map