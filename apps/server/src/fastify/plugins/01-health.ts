import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import health from "fastify-healthcheck";
import pino from "pino";

const logger = pino.default();

export default fp(async function (fastify: FastifyInstance) {
  logger.info(`Registering health.`);
  fastify.register(health, {
    exposeUptime: true,
  });
});
