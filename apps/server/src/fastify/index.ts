// Import the framework and instantiate it
import Fastify from "fastify";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: true,
});

await fastify.register(autoLoad, {
  dir: join(__dirname, "plugins"),
});
await fastify.register(autoLoad, {
  dir: join(__dirname, "routes"),
});
await fastify.ready();
// fastify.swagger();

// Run the server!
try {
  await fastify.listen({ port: 7778 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
