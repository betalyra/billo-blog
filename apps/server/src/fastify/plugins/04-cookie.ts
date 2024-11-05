import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyCookieOptions } from "@fastify/cookie";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.log.info(`Registering cookie.`);
  fastify.register(cookie, {
    secret: fastify.env.SESSION_SECRET,
  } as FastifyCookieOptions);
});
