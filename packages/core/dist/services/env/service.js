import { Context, Effect, Layer, LogLevel, Match } from "effect";
import { z } from "zod";
export const IEnv = z.object({
    POSTGRES_URL: z.string().url(),
    POSTGRES_SSL_CERTIFICATE: z.string().optional(),
    MIGRATIONS_FOLDER: z.string().optional().default("../../migrations/postgres"),
    LOG_LEVEL: z
        .enum([
        "All",
        "Debug",
        "Info",
        "Error",
        "None",
        "Fatal",
        "Warning",
        "Trace",
    ])
        .optional()
        .default("Info")
        .transform(LogLevel.fromLiteral),
});
export class EnvService extends Context.Tag("EnvService")() {
}
export const EnvServiceLive = Layer.effect(EnvService, Effect.gen(function* () {
    const parseResult = IEnv.safeParse(process.env);
    const env = yield* parseResult.success
        ? Effect.succeed(parseResult.data)
        : Effect.fail(parseResult.error);
    return env;
}));
//# sourceMappingURL=service.js.map