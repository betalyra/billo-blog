// Import the framework and instantiate it
import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Effect } from "effect";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runServer = Effect.tryPromise(async () => {
  const fastify = Fastify({
    logger: false,
  });

  await fastify.register(autoLoad, {
    dir: join(__dirname, "plugins"),
  });
  await fastify.register(autoLoad, {
    dir: join(__dirname, "routes"),
  });
  await fastify.ready();

  await fastify.listen({ port: 7778 });
});
export default runServer;
