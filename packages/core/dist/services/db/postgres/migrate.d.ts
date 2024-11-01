import { Context, Effect, Layer } from "effect";
import { DrizzlePostgresProvider } from "./provider.js";
import { EnvService } from "../../env/service.js";
export type IDrizzleMigrateService = {
    migrate: Effect.Effect<void, Error>;
};
declare const DrizzleMigrateService_base: Context.TagClass<DrizzleMigrateService, "DrizzleMigrateService", IDrizzleMigrateService>;
export declare class DrizzleMigrateService extends DrizzleMigrateService_base {
}
export declare const DrizzleMigrateServiceLive: Layer.Layer<DrizzleMigrateService, Error, EnvService | import("effect/Scope").Scope | DrizzlePostgresProvider>;
export {};
//# sourceMappingURL=migrate.d.ts.map