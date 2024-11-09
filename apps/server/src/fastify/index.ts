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
    env: IEnv;
  }
}
const init = async () => {
  const env = IEnv.safeParse(process.env);
  if (!env.success) {
    throw new Error(env.error.message);
  }
  const fastify = Fastify({
    logger: true,
  });

  fastify.decorate("env", env.data);
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

  await fastify.listen({ port: env.data.PORT, host: env.data.HOST });
  fastify.log.info(`🪁 Server started on ${env.data.HOST}:${env.data.PORT}`);
};
export default init;
