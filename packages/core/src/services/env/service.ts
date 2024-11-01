import { Context, Effect, Layer, LogLevel, Match } from "effect";
import { z } from "zod";

export const IEnv = z.object({
  POSTGRES_URL: z.string().url(),
  POSTGRES_SSL_CERTIFICATE: z.string().optional(),
  MIGRATIONS_FOLDER: z.string().optional().default("../../migrations/postgres"),
});
export type IEnv = z.infer<typeof IEnv>;

export class EnvService extends Context.Tag("EnvService")<EnvService, IEnv>() {}
export const EnvServiceLive = Layer.effect(
  EnvService,
  Effect.gen(function* () {
    const parseResult = IEnv.safeParse(process.env);
    const env = yield* parseResult.success
      ? Effect.succeed(parseResult.data)
      : Effect.fail(parseResult.error);
    return env;
  })
);
