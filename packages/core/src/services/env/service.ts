import { Context, Effect, Layer, Logger, LogLevel, Match } from "effect";
import { z } from "zod";

export const IEnv = z.object({
  HOST: z.string().optional().default("localhost"),
  PORT: z.coerce.number().optional().default(31337),
  SESSION_SECRET: z.string(),
  SESSION_COOKIE_URL: z.string().url(),
  SESSION_COOKIE_SECURE: z.coerce.boolean().optional().default(true),
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
  SIGNUP_ALLOWED: z
    .enum(["all", "none", "invite"])
    .optional()
    .default("invite"),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_REDIRECT_URI: z.string().url(),
  ARTICLE_UPDATE_INTERVAL: z
    .number()
    .int()
    .min(1)
    .max(60 * 60)
    .optional()
    .default(60)
    .describe(
      "Update interval with which new versions of articles are created"
    ),
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
