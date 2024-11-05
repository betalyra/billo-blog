import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import health from "fastify-healthcheck";

export default fp(async function (fastify: FastifyInstance) {
  fastify.log.info(`🏥 Registering health.`);
  fastify.register(health, {
    exposeUptime: true,
  });
});
