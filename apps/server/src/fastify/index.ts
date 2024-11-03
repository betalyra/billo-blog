// Import the framework and instantiate it
import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Effect, Layer } from "effect";
import {
  DrizzlePostgresProvider,
  EnvService,
  type IDrizzlePostgresProvider,
} from "@billo-blog/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare module "fastify" {
  interface FastifyInstance {
    postgresDrizzle: Layer.Layer<DrizzlePostgresProvider, never, never>;
  }
}
const runServer = Effect.gen(function* () {
  const { postgresDrizzle } = yield* DrizzlePostgresProvider;
  const { HOST, PORT } = yield* EnvService;
  yield* Effect.logInfo("Starting server...");
  yield* Effect.tryPromise(async () => {
    const fastify = Fastify({
      logger: false,
    });

    fastify.decorate(
      "postgresDrizzle",
      Layer.succeed(DrizzlePostgresProvider)({ postgresDrizzle })
    );
    await fastify.register(autoLoad, {
      dir: join(__dirname, "plugins"),
    });
    await fastify.register(autoLoad, {
      dir: join(__dirname, "routes"),
    });
    await fastify.ready();

    await fastify.listen({ port: PORT, host: HOST });
  });
  yield* Effect.logInfo(`🪁 Server started on ${HOST}:${PORT}`);
});
export default runServer;
