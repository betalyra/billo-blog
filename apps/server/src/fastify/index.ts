// Import the framework and instantiate it
import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Effect, Layer } from "effect";
import { DrizzlePostgresProvider, EnvService, IEnv } from "@billo-blog/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare module "fastify" {
  interface FastifyInstance {
    postgresDrizzle: Layer.Layer<DrizzlePostgresProvider, never, never>;
    env: IEnv;
  }
}
const runServer = Effect.gen(function* () {
  const { postgresDrizzle } = yield* DrizzlePostgresProvider;
  const env = yield* EnvService;
  yield* Effect.logInfo("Starting server...");
  yield* Effect.tryPromise(async () => {
    const fastify = Fastify({
      logger: false,
    });

    fastify.decorate(
      "postgresDrizzle",
      Layer.succeed(DrizzlePostgresProvider)({ postgresDrizzle })
    );
    fastify.decorate("env", env);
    await fastify.register(autoLoad, {
      dir: join(__dirname, "plugins"),
    });
    await fastify.register(autoLoad, {
      dir: join(__dirname, "routes"),
    });
    // Register parent error handler
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error);
      console.error(error);
      reply.status(500).send({ ok: false });
    });
    await fastify.ready();

    await fastify.listen({ port: env.PORT, host: env.HOST });
  });
  yield* Effect.logInfo(`🪁 Server started on ${env.HOST}:${env.PORT}`);
});
export default runServer;
